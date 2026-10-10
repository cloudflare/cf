import { stat } from "node:fs/promises";
import path from "node:path";
import {
	migrateWranglerToCf,
	type MigrationFollowUp,
	type WranglerToCfMigrationOptions,
	type WranglerToCfMigrationResult,
} from "@cloudflare/codemods";
import { DEPENDENCIES_INSTRUMENTATION_ENV_VAR } from "./build-output.js";
import { CliExit } from "./cli-exit.js";
import { success, theme, warning } from "./ui/index.js";

const DEFAULT_CONFIG_FILES = [
	"wrangler.json",
	"wrangler.jsonc",
	"wrangler.toml",
] as const satisfies string[];

type MigrationOutput = "stdout" | "stderr" | "silent";
type MigrationBundler = NonNullable<WranglerToCfMigrationOptions["bundler"]>;

interface RunWranglerMigrationOptions extends WranglerToCfMigrationOptions {
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
	cwd: string,
	{ failOnMultiple = true }: { failOnMultiple?: boolean } = {}
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
	if (!failOnMultiple) {
		return;
	}

	throw new Error(
		`Multiple Wrangler configs found in ${cwd}. Pass the exact path to cf migrate.`
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
	const { discoverImpls } = await import("../commands/dev/discover.js");
	return discoverImpls(path.dirname(configPath)).some(
		({ impl }) => impl.pkg === "@cloudflare/vite-plugin"
	)
		? "vite"
		: "wrangler";
}

function createLogger(output: MigrationOutput): (message: string) => void {
	if (output === "silent") {
		return () => {};
	}
	return output === "stderr" ? console.error : console.log;
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
		const indent = `${isLast ? " " : "│"}  └─`;
		if (followUp.docsUrl) {
			log(`${theme.muted(indent)} ${theme.muted(followUp.docsUrl)}`);
		}
		if (isDependenciesInstrumentationFollowUp(followUp)) {
			log(
				`${theme.muted(indent)} ${theme.muted(`Set ${DEPENDENCIES_INSTRUMENTATION_ENV_VAR}=false to leave package metadata out of uploads.`)}`
			);
		}
	}
}

// The new config has no `dependencies_instrumentation` field yet, so the
// migration drops it. Point at the environment opt-out until the field exists.
function isDependenciesInstrumentationFollowUp(
	followUp: MigrationFollowUp
): boolean {
	return (
		followUp.sourcePath === "dependencies_instrumentation" ||
		followUp.sourcePath?.endsWith(".dependencies_instrumentation") === true
	);
}

function printResult(
	result: WranglerToCfMigrationResult,
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

export async function runWranglerMigration(
	configPath: string,
	options: RunWranglerMigrationOptions = {}
): Promise<void> {
	const dryRun = options.dryRun ?? false;
	const result = await migrateWranglerToCf(configPath, {
		bundler: options.bundler ?? "vite",
		dryRun,
		force: options.force ?? false,
		installDependencies: options.installDependencies ?? true,
	});

	printResult(
		result,
		dryRun,
		path.dirname(configPath),
		createLogger(options.output ?? "stdout")
	);
	if (result.status === "needs-intervention") {
		throw new CliExit(1);
	}
}

/**
 * Offer to convert a Wrangler config before framework setup. Returns true
 * only after the user accepts and the conversion command completes, including
 * when it runs in dry-run mode.
 */
export async function maybeMigrateWranglerProject(
	projectPath: string,
	confirmMigration: ConfirmMigration,
	output: MigrationOutput = "stdout",
	dryRun = false
): Promise<boolean> {
	const configPath = await findWranglerConfig(projectPath, {
		failOnMultiple: false,
	});
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
		return false;
	}

	const bundler = await detectWranglerMigrationBundler(configPath);
	await runWranglerMigration(configPath, { bundler, output, dryRun });
	return true;
}
