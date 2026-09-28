import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * temporary-credentials command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "temporary-credentials",
	describe:
		"Generate short-lived S3-compatible credentials scoped to specific buckets and operations",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
