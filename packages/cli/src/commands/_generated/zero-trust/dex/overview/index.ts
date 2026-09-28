import $tests from "./tests/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * overview command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "overview",
	describe: "Operations for dex.overview",

	builder: (yargs) => {
		return yargs
			.command($tests)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
