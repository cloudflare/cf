import $bulkupdate from "./bulk-update.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $pskgenerate from "./psk-generate.js";
import $pskset from "./psk-set.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ipsec-tunnels command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ipsec-tunnels",
	describe:
		"IPsec tunnel endpoints with pre-shared key management for encrypted transit",

	builder: (yargs) => {
		return yargs
			.command($bulkupdate)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($pskgenerate)
			.command($pskset)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
