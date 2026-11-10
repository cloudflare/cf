import $dnssec from "./dnssec/index.js";
import $records from "./records/index.js";
import $settings from "./settings/index.js";
import $usage from "./usage/index.js";
import $zonetransfers from "./zone-transfers/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dns command
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dns",
	describe: "dns",

	builder: (yargs) => {
		return yargs
			.command($dnssec)
			.command($records)
			.command($settings)
			.command($usage)
			.command($zonetransfers)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
