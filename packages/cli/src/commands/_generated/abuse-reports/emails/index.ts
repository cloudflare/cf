import $listsubmitted from "./list-submitted.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * emails command group
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "emails",
	describe: "Emails sent for abuse reports",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($listsubmitted)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
