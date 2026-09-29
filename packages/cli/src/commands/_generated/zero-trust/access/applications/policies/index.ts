import $makereusable from "./make-reusable.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * policies command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "policies",
	describe: "Operations for access.applications.policies",

	builder: (yargs) => {
		return yargs
			.command($makereusable)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
