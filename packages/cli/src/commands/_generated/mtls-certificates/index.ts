import $associations from "./associations/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * mtls-certificates command
 * @generated from apis/overlays/mtls-certificates.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "mtls-certificates",
	describe: "mtls-certificates",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($associations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
