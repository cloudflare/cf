import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * operations command group
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "operations",
	describe: "Operations for schema-validation.schemas.operations",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
