import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * reusable command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "reusable",
	describe: "Operations for apps.policies.make.reusable",

	builder: (yargs) => {
		return yargs
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
