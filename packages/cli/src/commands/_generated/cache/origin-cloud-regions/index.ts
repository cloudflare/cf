import $bulkdelete from "./bulk-delete.js";
import $bulkupdate from "./bulk-update.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $supportedregions from "./supported-regions.js";
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
			.command($bulkupdate)
			.command($delete)
			.command($get)
			.command($list)
			.command($supportedregions)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
