import $edit from "./edit.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * credentials command group
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "credentials",
	describe: "Operations for token-validation.configurations.credentials",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
