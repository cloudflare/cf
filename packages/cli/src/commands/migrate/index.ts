import { stat } from "node:fs/promises";
import path from "node:path";
import {
	migrateWranglerToCf,
	type MigrationFollowUp,
	type WranglerToCfMigrationResult,
} from "@cloudflare/codemods";
import { CliExit } from "../../index.js";
import { success, theme, warning } from "../../lib/ui/index.js";
import { discoverImpls } from "../dev/discover.js";
import type { CommonYargsOptions, InferArgs } from "../../lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

const DEFAULT_CONFIG_FILES = [
	"wrangler.json",
	"wrangler.jsonc",
	"wrangler.toml",
] as const satisfies string[];

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("path", {
			type: "string",
			description: `Path to a Wrangler configuration file`,
		})
		.option("bundler", {
			choices: ["vite", "wrangler"] as const,
			description: `Bundler to use in the migrated project (defaults to vite when @cloudflare/vite-plugin is declared, otherwise wrangler)`,
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description: `Show the files that would change without writing them`,
		})
		.option("force", {
			type: "boolean",
			default: false,
			description: `Run even if the Git worktree is not clean`,
		})
		.option("install", {
			type: "boolean",
			default: true,
			description: `Install cf as a project dependency (use --no-install to skip)`,
		});
}

type MigrateArgs = InferArgs<typeof builder>;
type MigrationBundler = NonNullable<MigrateArgs["bundler"]>;

function detectBundler(projectDirectory: string): MigrationBundler {
	return discoverImpls(projectDirectory).some(
		({ impl }) => impl.pkg === "@cloudflare/vite-plugin"
	)
		? "vite"
		: "wrangler";
}

function printDetectedBundler(bundler: MigrationBundler): void {
	console.log(
		theme.muted(
			bundler === "vite"
				? "Using the Vite bundler because @cloudflare/vite-plugin is declared. Pass --bundler wrangler to override."
				: "Using the Wrangler bundler because @cloudflare/vite-plugin is not declared. Pass --bundler vite to override."
		)
	);
}

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

async function resolveConfigPath(
	configPath: string | undefined
): Promise<string> {
	const cwd = process.cwd();

	if (configPath !== undefined) {
		return path.resolve(cwd, configPath);
	}

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
	if (existingCandidates.length === 1 && existingCandidate !== undefined) {
		return existingCandidate;
	}
	if (existingCandidates.length === 0) {
		throw new Error(
			`No Wrangler config found in ${cwd}. Pass its path to cf migrate.`
		);
	}

	throw new Error(
		`Multiple Wrangler configs found in ${cwd}. Pass the exact path to cf migrate.`
	);
}

function printFollowUps(followUps: readonly MigrationFollowUp[]): void {
	if (followUps.length === 0) {
		return;
	}

	console.log(`\n${theme.bold("Follow-up work:")}`);
	for (const [index, followUp] of followUps.entries()) {
		const isLast = index === followUps.length - 1;
		const connector = isLast ? "└─" : "├─";
		const severity = followUp.blocking
			? theme.error("[required]")
			: theme.info("[info]");
		const source = followUp.sourcePath
			? `${theme.code(followUp.sourcePath)}: `
			: "";
		console.log(
			`${theme.muted(connector)} ${severity} ${source}${followUp.message}`
		);
		if (followUp.docsUrl) {
			console.log(
				`${theme.muted(`${isLast ? " " : "│"}  └─`)} ${theme.muted(followUp.docsUrl)}`
			);
		}
	}
}

function printResult(
	result: WranglerToCfMigrationResult,
	dryRun: boolean,
	configDirectory: string
): void {
	if (result.changedFiles.length > 0) {
		console.log(
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
			console.log(`${theme.muted(connector)} ${theme.code(displayPath)}`);
		}
	}

	printFollowUps(result.followUps);

	if (result.status === "needs-intervention") {
		console.log(`\n${warning("Migration requires follow-up work.")}`);
		return;
	}

	console.log(`\n${success(`Migration${dryRun ? " preview" : ""} complete.`)}`);
}

const migrateCommand: CommandModule<CommonYargsOptions, MigrateArgs> = {
	command: "migrate [path]",
	describe: "Migrate a Wrangler project to cf",
	builder,
	handler: async (args) => {
		const configPath = await resolveConfigPath(args.path);
		const bundler = args.bundler ?? detectBundler(path.dirname(configPath));
		if (args.bundler === undefined) {
			printDetectedBundler(bundler);
		}
		const result = await migrateWranglerToCf(configPath, {
			bundler,
			dryRun: args["dry-run"],
			force: args.force,
			installDependencies: args.install,
		});

		printResult(result, args["dry-run"], path.dirname(configPath));
		if (result.status === "needs-intervention") {
			throw new CliExit(1);
		}
	},
};

export default migrateCommand;
