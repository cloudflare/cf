import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * hosts command group
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "hosts",
	describe: "Operations for schema-validation.schemas.hosts",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
