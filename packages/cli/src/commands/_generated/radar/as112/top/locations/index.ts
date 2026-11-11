import $dnssec from "./dnssec/index.js";
import $edns from "./edns/index.js";
import $get from "./get.js";
import $ipversion from "./ip-version/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * locations command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "locations",
	describe: "Operations for as112.top.locations",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($dnssec)
			.command($edns)
			.command($ipversion)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
