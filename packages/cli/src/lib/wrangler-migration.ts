import { stat } from "node:fs/promises";
import path from "node:path";
import {
	migrateBundler,
	migrateWranglerConfig,
	type BundlerMigrationOptions,
	type MigrationFollowUp,
	type MigrationResult,
} from "@cloudflare/autoconfig";
import { CliExit } from "./cli-exit.js";
import { success, theme, warning } from "./ui/index.js";

const DEFAULT_CONFIG_FILES = [
	"wrangler.json",
	"wrangler.jsonc",
	"wrangler.toml",
] as const satisfies string[];

type MigrationOutput = "stderr" | "silent";
type MigrationBundler = NonNullable<BundlerMigrationOptions["bundler"]>;

interface RunWranglerMigrationOptions extends BundlerMigrationOptions {
	/** Whether to migrate even if the Git worktree is not clean */
	force?: boolean;
	output?: MigrationOutput;
}

interface ConfirmMigrationOptions {
	defaultValue: boolean;
	fallbackValue?: boolean;
}

type ConfirmMigration = (
	text: string,
	options: ConfirmMigrationOptions
) => Promise<boolean>;

async function fileExists(filePath: string): Promise<boolean> {
	try {
		return (await stat(filePath)).isFile();
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			return false;
		}
		throw error;
	}
}

export async function findWranglerConfig(
	cwd: string
): Promise<string | undefined> {
	const candidates = DEFAULT_CONFIG_FILES.map((fileName) =>
		path.join(cwd, fileName)
	);
	const existingCandidates = (
		await Promise.all(
			candidates.map(async (candidate) => ({
				candidate,
				exists: await fileExists(candidate),
			}))
		)
	)
		.filter(({ exists }) => exists)
		.map(({ candidate }) => candidate);

	const [existingCandidate] = existingCandidates;
	if (existingCandidates.length <= 1) {
		return existingCandidate;
	}
	throw new Error(
		`Multiple Wrangler configs found in ${cwd}. Pass the exact path to cf migrate, or continue using Wrangler with your chosen config.`
	);
}

export async function resolveWranglerConfigPath(
	configPath: string | undefined,
	cwd = process.cwd()
): Promise<string> {
	if (configPath !== undefined) {
		return path.resolve(cwd, configPath);
	}

	const discoveredConfigPath = await findWranglerConfig(cwd);
	if (discoveredConfigPath !== undefined) {
		return discoveredConfigPath;
	}

	throw new Error(
		`No Wrangler config found in ${cwd}. Pass its path to cf migrate.`
	);
}

export async function detectWranglerMigrationBundler(
	configPath: string
): Promise<MigrationBundler> {
	const { readDeclaredNpmDependencies } =
		await import("../commands/dev/discover.js");
	return readDeclaredNpmDependencies(path.dirname(configPath)).has(
		"@cloudflare/vite-plugin"
	)
		? "vite"
		: "wrangler";
}

function createLogger(output: MigrationOutput): (message: string) => void {
	if (output === "silent") {
		return () => {};
	}
	return console.error;
}

function printFollowUps(
	followUps: readonly MigrationFollowUp[],
	log: (message: string) => void
): void {
	if (followUps.length === 0) {
		return;
	}

	log(`\n${theme.bold("Follow-up work:")}`);
	for (const [index, followUp] of followUps.entries()) {
		const isLast = index === followUps.length - 1;
		const connector = isLast ? "└─" : "├─";
		const severity = followUp.blocking
			? theme.error("[required]")
			: theme.info("[info]");
		const source = followUp.sourcePath
			? `${theme.code(followUp.sourcePath)}: `
			: "";
		log(`${theme.muted(connector)} ${severity} ${source}${followUp.message}`);
		if (followUp.docsUrl) {
			log(
				`${theme.muted(`${isLast ? " " : "│"}  └─`)} ${theme.muted(followUp.docsUrl)}`
			);
		}
	}
}

function printResult(
	result: MigrationResult,
	dryRun: boolean,
	configDirectory: string,
	log: (message: string) => void
): void {
	if (result.changedFiles.length > 0) {
		log(
			theme.bold(
				`${dryRun ? "Would update" : "Updated"} ${result.changedFiles.length} file(s):`
			)
		);
		for (const [index, changedFile] of result.changedFiles.entries()) {
			const connector = index === result.changedFiles.length - 1 ? "└─" : "├─";
			const displayPath = path.relative(
				process.cwd(),
				path.resolve(configDirectory, changedFile)
			);
			log(`${theme.muted(connector)} ${theme.code(displayPath)}`);
		}
	}

	printFollowUps(result.followUps, log);

	if (result.status === "needs-intervention") {
		log(`\n${warning("Migration requires follow-up work.")}`);
		return;
	}

	log(`\n${success(`Migration${dryRun ? " preview" : ""} complete.`)}`);
}

function getBundlerName(bundler: MigrationBundler): string {
	return bundler === "vite" ? "Vite" : "Wrangler";
}

/**
 * Migrate a Wrangler config in four steps: detect the project, migrate its Worker settings to
 * `cloudflare.config.ts`, set up its framework, then migrate its build settings for the
 * bundler that setup chose.
 */
export async function runWranglerMigration(
	configPath: string,
	options: RunWranglerMigrationOptions = {}
): Promise<void> {
	const dryRun = options.dryRun ?? false;
	const installDependencies = options.installDependencies ?? true;
	const output = options.output ?? "stderr";
	const log = createLogger(output);
	const projectPath = path.dirname(configPath);
	const { analyzeProject, configureProject } = await import("./autoconfig.js");

	// Detected before `cloudflare.config.ts` exists, which would mark the project as set up
	const details = await analyzeProject(projectPath, {
		output,
		wranglerConfigPath: configPath,
	});
	const settings = await migrateWranglerConfig(configPath, {
		dryRun,
		force: options.force,
	});

	let bundler = options.bundler;
	// Framework setup installs packages, and a project without a framework has nothing to set up
	if (installDependencies && details && details.framework?.id !== "static") {
		const { buildTool } = await configureProject(details, { dryRun, output });
		if (buildTool !== undefined) {
			if (bundler !== undefined && bundler !== buildTool) {
				log(
					warning(
						`Using the ${getBundlerName(buildTool)} bundler instead of --bundler ${bundler}, because ${details.framework?.name ?? "the framework"} builds with it.`
					)
				);
			}
			bundler = buildTool;
		}
	}
	if (bundler === undefined) {
		bundler = await detectWranglerMigrationBundler(configPath);
		log(
			theme.muted(
				bundler === "vite"
					? "Using the Vite bundler because @cloudflare/vite-plugin is declared. Run cf migrate with --bundler wrangler to choose another."
					: "Using the Wrangler bundler because @cloudflare/vite-plugin is not declared. Run cf migrate with --bundler vite to choose another."
			)
		);
	}
	const build = await migrateBundler(configPath, {
		bundler,
		dryRun,
		installDependencies,
	});

	const result: MigrationResult = {
		...build,
		changedFiles: [
			...new Set([...settings.changedFiles, ...build.changedFiles]),
		],
		followUps: [...settings.followUps, ...build.followUps],
		status: settings.status === "complete" ? build.status : settings.status,
	};
	printResult(result, dryRun, projectPath, log);
	if (result.status === "needs-intervention") {
		throw new CliExit(1);
	}
}

/**
 * Offer to convert a Wrangler config before framework setup. Only projects
 * without a Wrangler config may fall through to framework setup.
 */
export async function maybeMigrateWranglerProject(
	projectPath: string,
	confirmMigration: ConfirmMigration,
	output: MigrationOutput = "stderr",
	dryRun = false
): Promise<boolean> {
	const configPath = await findWranglerConfig(projectPath);
	if (configPath === undefined) {
		return false;
	}

	const displayPath =
		path.relative(process.cwd(), configPath) || path.basename(configPath);
	const accepted = await confirmMigration(
		`A Wrangler config was found at ${theme.code(displayPath)}. Run cf migrate before continuing?`,
		{
			defaultValue: true,
			fallbackValue: false,
		}
	);
	if (!accepted) {
		throw new Error(
			`Wrangler migration did not run. Run ${theme.code(`cf migrate ${displayPath}`)} before trying again, or continue using Wrangler with your existing config.`
		);
	}

	await runWranglerMigration(configPath, { output, dryRun });
	return true;
}
