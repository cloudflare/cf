import $config from "./config/index.js";
import $results from "./results/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scans command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scans",
	describe: "Scan URLs, IPs, and domains for threat intelligence indicators",

	builder: (yargs) => {
		return yargs
			.command($config)
			.command($results)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
