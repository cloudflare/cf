import { existsSync } from "node:fs";
import { join } from "node:path";
import { createConfigCache } from "@cloudflare/workers-utils";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { CommandModule } from "yargs";
import { CliExit } from "#lib/cli-exit.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "deploy [directory]",
	describe: "Deploy a directory of static assets as a Pages deployment",
	builder: (yargs) =>
		yargs.positional("directory", {
			type: "string",
			description: "Pages build output directory (not deployed by cf)",
		}),
	handler: (argv) => {
		if (argv.local) {
			throw new Error("--local is not supported by cf pages deploy.");
		}

		const cachePath = join(
			createConfigCache(console).getCacheFolder(),
			"pages.json"
		);
		if (existsSync(cachePath)) {
			console.error(
				"Legacy Pages is not supported in `cf`. Please use `npx wrangler pages deploy` for this project."
			);
		} else {
			console.error(
				"Legacy Pages is not supported in `cf`. To deploy to the new version of Pages on Workers, use `cf deploy` instead."
			);
		}

		throw new CliExit(1);
	},
};

export default command;
