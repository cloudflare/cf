import $assets from "./assets.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * custom command group
 * @generated from apis/overlays/custom-pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "custom",
	describe: "Operations for assets.list.custom",

	builder: (yargs) => {
		return yargs
			.command($assets)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
