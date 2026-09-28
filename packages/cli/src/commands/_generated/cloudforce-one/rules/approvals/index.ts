import $cancel from "./cancel.js";
import $get from "./get.js";
import $list from "./list.js";
import $resubmit from "./resubmit.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * approvals command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "approvals",
	describe: "Approval workflow operations",

	builder: (yargs) => {
		return yargs
			.command($cancel)
			.command($get)
			.command($list)
			.command($resubmit)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
