import $bulkupdate from "./bulk-update.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cf-interconnects command group
 * @generated from apis/overlays/magic-transit.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cf-interconnects",
	describe:
		"Cloudflare Network Interconnect (CNI) links for direct physical or virtual peering",

	builder: (yargs) => {
		return yargs
			.command($bulkupdate)
			.command($get)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
