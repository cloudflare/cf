import $get from "./get.js";
import $list from "./list.js";
import $maintenanceconfigs from "./maintenance-configs/index.js";
import $maintenanceruns from "./maintenance-runs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tables command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tables",
	describe: "Tables within catalog namespaces",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($list)
			.command($maintenanceconfigs)
			.command($maintenanceruns)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
