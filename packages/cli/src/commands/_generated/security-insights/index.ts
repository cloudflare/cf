import $context from "./context/index.js";
import $partners from "./partners/index.js";
import $state from "./state/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * security-insights command
 * @generated from apis/overlays/security-insights.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "security-insights",
	describe: "security-insights",

	builder: (yargs) => {
		return yargs
			.command($context)
			.command($partners)
			.command($state)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
