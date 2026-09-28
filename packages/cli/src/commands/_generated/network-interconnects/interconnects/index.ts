import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $loadefaultname from "./loa-default-name.js";
import $loa from "./loa.js";
import $status from "./status.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * interconnects command group
 * @generated from apis/overlays/network-interconnects.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "interconnects",
	describe:
		"Physical cross-connect and partner interconnect sessions with LOA and status tracking",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($loa)
			.command($loadefaultname)
			.command($status)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
