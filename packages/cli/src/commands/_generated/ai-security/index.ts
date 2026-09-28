import $customtopics from "./custom-topics/index.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ai-security command
 * @generated from apis/overlays/ai-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ai-security",
	describe:
		"Detect prompt injection, PII, and unsafe topics in traffic to your AI applications",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($update)
			.command($customtopics)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
