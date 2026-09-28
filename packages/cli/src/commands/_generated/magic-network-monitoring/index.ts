import $configs from "./configs/index.js";
import $rules from "./rules/index.js";
import $vpcflows from "./vpc-flows/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * magic-network-monitoring command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "magic-network-monitoring",
	describe:
		"Flow-based network traffic monitoring with configurable alerting rules and VPC flow ingestion",

	builder: (yargs) => {
		return yargs
			.command($configs)
			.command($rules)
			.command($vpcflows)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
