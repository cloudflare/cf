import $bulkdelete from "./bulk-delete.js";
import $bulkreplace from "./bulk-replace.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $regions from "./regions/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * origin-cloud-regions command group
 * @generated from apis/overlays/cache.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "origin-cloud-regions",
	describe: "Manage Origin Cloud Regions routing and failover configurations",

	builder: (yargs) => {
		return yargs
			.command($bulkdelete)
			.command($bulkreplace)
			.command($delete)
			.command($get)
			.command($list)
			.command($update)
			.command($regions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
