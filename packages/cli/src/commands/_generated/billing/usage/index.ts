import $getaccountbillablemetrics from "./get-account-billable-metrics.js";
import $getaccountusagev2 from "./get-account-usage-v2.js";
import $getinfov1 from "./get-info-v1.js";
import $getv1 from "./get-v1.js";
import $query from "./query.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * usage command group
 * @generated from apis/overlays/billing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "usage",
	describe:
		"Metered usage data for billed services — requests, bandwidth, and feature consumption",

	builder: (yargs) => {
		return yargs
			.command($getaccountbillablemetrics)
			.command($getaccountusagev2)
			.command($getinfov1)
			.command($getv1)
			.command($query)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
