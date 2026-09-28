import $discovery from "./discovery/index.js";
import $labels from "./labels/index.js";
import $operations from "./operations/index.js";
import $schemas from "./schemas/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * web-assets command
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "web-assets",
	describe: "web-assets",

	builder: (yargs) => {
		return yargs
			.command($discovery)
			.command($labels)
			.command($operations)
			.command($schemas)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
