import fs from "node:fs";
import path from "node:path";
import { formatOutput } from "#lib/output.js";
import { confirm } from "#lib/prompt.js";
import { Minimatch } from "minimatch";
import {
	getNextMigrationNumber,
	normalizeRelativePath,
	resolveMigrationsConfig,
} from "./bookkeeping.js";
import { migrationsFileOptions } from "./shared.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return migrationsFileOptions(
		yargs.positional("message", {
			type: "string",
			description: "Describes what the migration does",
			demandOption: true,
		})
	);
}

type Args = InferArgs<typeof builder>;

/**
 * Scaffold an empty migration file.
 *
 * Entirely local — no database and no network, because `--dir` is a flag
 * rather than something read out of config. If an ORM manages your
 * migrations, use its own generator instead; for Drizzle, that is
 * `drizzle-kit generate`. This command exists for projects that hand-write SQL.
 */
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <message>",
	describe: "Create a new empty D1 migration file",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.local) {
			throw new Error(
				"--local is not supported with `cf d1 migrations create`. This command only creates a migration file on your local filesystem, so you do not need --local."
			);
		}

		const config = resolveMigrationsConfig({
			dir: argv.dir,
			pattern: argv.pattern,
		});

		const nextNumber = pad(getNextMigrationNumber(config), 4);
		const migrationName = argv.message.replaceAll(" ", "_");

		// `create` writes a single file directly inside the migrations dir, so
		// a separator in the name would imply nested directories it will not
		// make. Reject up front rather than failing the pattern check below
		// with a more confusing message.
		if (/[\\/]/.test(migrationName)) {
			throw new Error(
				`The migration name ${JSON.stringify(argv.message)} contains a path separator ("/" or "\\"). Remove it and try again.`
			);
		}

		const fileName = `${nextNumber}_${migrationName}.sql`;

		// Make sure `apply` would actually pick the new file up — the default
		// pattern always matches a top-level `.sql`, so this only fires when
		// --pattern has been narrowed (typically to an ORM's nested layout).
		const proposedPath = normalizeRelativePath(
			`${config.migrationsDir}/${fileName}`
		);
		const matcher = new Minimatch(config.migrationsPattern, { dot: false });
		if (!matcher.match(proposedPath)) {
			throw new Error(
				`Would create "${proposedPath}", but --pattern "${config.migrationsPattern}" would not match it, so \`cf d1 migrations apply\` would skip it.\n` +
					`\`cf d1 migrations create\` only writes top-level files inside --dir. If you are using an ORM like Drizzle, use \`drizzle-kit generate\` instead — it writes the nested layout your pattern expects.`
			);
		}

		if (!fs.existsSync(config.migrationsPath)) {
			const ok = await confirm(
				`No migrations folder found.\nOk to create ${config.migrationsPath}?`
			);
			if (!ok) {
				throw new Error(
					`No migrations folder present at ${config.migrationsPath}.`
				);
			}
			fs.mkdirSync(config.migrationsPath, { recursive: true });
		}

		const filePath = path.join(config.migrationsPath, fileName);
		fs.writeFileSync(
			filePath,
			`-- Migration number: ${nextNumber} \t ${new Date().toISOString()}\n`
		);

		formatOutput(
			{ name: fileName, path: filePath },
			{ successLabel: `Created ${fileName}`, quiet: argv.quiet }
		);
	},
};

export default command;

function pad(num: number, size: number): string {
	let newNum = num.toString();
	while (newNum.length < size) {
		newNum = "0" + newNum;
	}
	return newNum;
}
