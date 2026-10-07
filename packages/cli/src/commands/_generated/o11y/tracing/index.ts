import $rules from "./rules/index.js";
import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tracing command group
 * @generated from apis/overlays/o11y.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tracing",
	describe: "Operations for tracing",

	builder: (yargs) => {
		return yargs
			.command($rules)
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
