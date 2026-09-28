import $buckets from "./buckets/index.js";
import $objects from "./objects/index.js";
import $superslurper from "./super-slurper/index.js";
import $temporarycredentials from "./temporary-credentials/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * r2 command
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "r2",
	describe:
		"S3-compatible object storage with zero egress fees — buckets, lifecycle rules, event notifications, and data migration",

	builder: (yargs) => {
		return yargs
			.command($buckets)
			.command($objects)
			.command($superslurper)
			.command($temporarycredentials)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
