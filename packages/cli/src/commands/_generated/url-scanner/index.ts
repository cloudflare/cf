import $responses from "./responses/index.js";
import $scans from "./scans/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * url-scanner command
 * @generated from apis/overlays/url-scanner.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "url-scanner",
	describe:
		"Scan URLs for phishing, malware, and other threats — submit scans and retrieve detailed results",

	builder: (yargs) => {
		return yargs
			.command($responses)
			.command($scans)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
