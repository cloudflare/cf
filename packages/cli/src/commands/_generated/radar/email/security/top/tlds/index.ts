import $get from "./get.js";
import $malicious from "./malicious/index.js";
import $spam from "./spam/index.js";
import $spoof from "./spoof/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tlds command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tlds",
	describe: "Operations for email.security.top.tlds",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($malicious)
			.command($spam)
			.command($spoof)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
