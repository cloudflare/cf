import $activate from "./activate.js";
import $create from "./create.js";
import $deactivate from "./deactivate.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * certificates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "certificates",
	describe: "Operations for gateway.certificates",

	builder: (yargs) => {
		return yargs
			.command($activate)
			.command($create)
			.command($deactivate)
			.command($delete)
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
