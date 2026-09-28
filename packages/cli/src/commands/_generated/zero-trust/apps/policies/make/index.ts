import $reusable from "./reusable/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * make command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "make",
	describe: "Operations for apps.policies.make",

	builder: (yargs) => {
		return yargs
			.command($reusable)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
