import $crawl from "./crawl/index.js";
import $devtools from "./devtools/index.js";
import $quickaction from "./quick-action/index.js";
import $recording from "./recording/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * browser-run command
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "browser-run",
	describe: "browser-run",

	builder: (yargs) => {
		return yargs
			.command($crawl)
			.command($devtools)
			.command($quickaction)
			.command($recording)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
