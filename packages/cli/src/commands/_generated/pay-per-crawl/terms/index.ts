import $getsignaturelink from "./get-signature-link.js";
import $getsignature from "./get-signature.js";
import $get from "./get.js";
import $sendsignatureevent from "./send-signature-event.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * terms command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "terms",
	describe: "Operations for terms",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($getsignature)
			.command($getsignaturelink)
			.command($sendsignatureevent)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
