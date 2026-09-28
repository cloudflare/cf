import $custom from "./custom/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * create command group
 * @generated from apis/overlays/custom-pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "create",
	describe: "Operations for assets.create",

	builder: (yargs) => {
		return yargs
			.command($custom)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
