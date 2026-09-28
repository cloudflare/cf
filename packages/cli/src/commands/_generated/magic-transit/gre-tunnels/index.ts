import $bulkupdate from "./bulk-update.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * gre-tunnels command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "gre-tunnels",
	describe:
		"GRE tunnel endpoints that connect your network to Cloudflare for Magic Transit",

	builder: (yargs) => {
		return yargs
			.command($bulkupdate)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
