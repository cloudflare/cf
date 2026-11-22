import $policies from "./policies/index.js";
import $policytests from "./policy-tests/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * applications command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "applications",
	describe: "Operations for access.applications",

	builder: (yargs) => {
		return yargs
			.command($policies)
			.command($policytests)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
