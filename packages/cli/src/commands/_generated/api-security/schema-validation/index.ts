import $schemas from "./schemas/index.js";
import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * schema-validation command group
 * @generated from apis/overlays/api-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "schema-validation",
	describe: "Operations for schema-validation",

	builder: (yargs) => {
		return yargs
			.command($schemas)
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
