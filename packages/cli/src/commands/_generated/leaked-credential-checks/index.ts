import $detections from "./detections/index.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * leaked-credential-checks command
 * @generated from apis/overlays/leaked-credential-checks.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "leaked-credential-checks",
	describe:
		"Detect compromised credentials in login requests by checking against known breach databases",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($update)
			.command($detections)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
