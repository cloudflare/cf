import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * operations command group
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "operations",
	describe: "Operations for labels.managed.operations",

	builder: (yargs) => {
		return yargs
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
