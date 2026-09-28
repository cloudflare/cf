import $eligible from "./eligible/index.js";
import $pagerduty from "./pagerduty/index.js";
import $webhooks from "./webhooks/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * destinations command group
 * @generated from apis/overlays/alerting.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "destinations",
	describe: "Operations for destinations",

	builder: (yargs) => {
		return yargs
			.command($eligible)
			.command($pagerduty)
			.command($webhooks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
