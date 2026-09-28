import $get from "./get.js";
import $networkpath from "./network-path/index.js";
import $percentiles from "./percentiles/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * traceroute command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "traceroute",
	describe: "Operations for dex.test-results.traceroute",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($networkpath)
			.command($percentiles)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
