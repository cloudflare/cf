import $dayreport from "./day-report.js";
import $fullreport from "./full-report.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * asn command group
 * @generated from apis/overlays/botnet-feed.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "asn",
	describe:
		"ASN-level botnet activity data showing networks with known C2 infrastructure",

	builder: (yargs) => {
		return yargs
			.command($dayreport)
			.command($fullreport)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
