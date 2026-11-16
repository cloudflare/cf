import $replace from "./replace.js";
import $resubmit from "./resubmit.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * approvals command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "approvals",
	describe:
		"Pending structured email rule approvals, which the original requester can revise",

	builder: (yargs) => {
		return yargs
			.command($replace)
			.command($resubmit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
