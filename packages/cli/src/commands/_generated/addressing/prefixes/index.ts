import $advertisementstatus from "./advertisement-status/index.js";
import $bgpprefixes from "./bgp-prefixes/index.js";
import $create from "./create.js";
import $delegations from "./delegations/index.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $servicebindings from "./service-bindings/index.js";
import $validate from "./validate/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * prefixes command group
 * @generated from apis/overlays/addressing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "prefixes",
	describe: "Operations for prefixes",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($advertisementstatus)
			.command($bgpprefixes)
			.command($delegations)
			.command($servicebindings)
			.command($validate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
