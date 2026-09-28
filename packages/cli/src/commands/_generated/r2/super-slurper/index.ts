import $connectivityprecheck from "./connectivity-precheck/index.js";
import $jobs from "./jobs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * super-slurper command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "super-slurper",
	describe:
		"Migrate data from external S3-compatible storage into R2 buckets with resumable transfer jobs",

	builder: (yargs) => {
		return yargs
			.command($connectivityprecheck)
			.command($jobs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
