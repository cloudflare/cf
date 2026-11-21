import $diagnose from "./diagnose.js";
import $send from "./send.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * feedback command
 * @generated from apis/overlays/feedback.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "feedback",
	describe: "feedback",

	builder: (yargs) => {
		return yargs
			.command($diagnose)
			.command($send)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
