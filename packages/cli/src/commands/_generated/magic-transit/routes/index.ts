import $bulkupdate from "./bulk-update.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $empty from "./empty.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * routes command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "routes",
	describe:
		"Static routes that direct IP prefix traffic through specific GRE/IPsec tunnels",

	builder: (yargs) => {
		return yargs
			.command($bulkupdate)
			.command($create)
			.command($delete)
			.command($empty)
			.command($get)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
