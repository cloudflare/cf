import $get from "./get.js";
import $percentiles from "./percentiles/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * http command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "http",
	describe: "Operations for dex.test-results.http",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($percentiles)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
