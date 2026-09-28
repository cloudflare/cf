import $resubmit from "./resubmit.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * approvals command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "approvals",
	describe: "Operations for rules.email.approvals",

	builder: (yargs) => {
		return yargs
			.command($resubmit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
