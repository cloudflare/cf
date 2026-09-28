import $appeals from "./appeals/index.js";
import $create from "./create.js";
import $emails from "./emails/index.js";
import $getsubmitted from "./get-submitted.js";
import $get from "./get.js";
import $listsubmitted from "./list-submitted.js";
import $list from "./list.js";
import $mitigations from "./mitigations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * abuse-reports command
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "abuse-reports",
	describe:
		"Submit and track abuse reports for phishing, malware, and other policy violations on Cloudflare-proxied sites",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.command($getsubmitted)
			.command($list)
			.command($listsubmitted)
			.command($appeals)
			.command($emails)
			.command($mitigations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
