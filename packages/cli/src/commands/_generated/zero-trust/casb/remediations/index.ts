import $jobs from "./jobs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * remediations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "remediations",
	describe: "Operations for casb.remediations",

	builder: (yargs) => {
		return yargs.command($jobs).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
