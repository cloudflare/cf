import $edit from "./edit.js";
import $get from "./get.js";
import $operations from "./operations/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * settings command group
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "settings",
	describe: "Operations for schema-validation.settings",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.command($update)
			.command($operations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
