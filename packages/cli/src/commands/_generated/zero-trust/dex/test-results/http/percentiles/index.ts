import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * percentiles command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "percentiles",
	describe: "Operations for dex.test-results.http.percentiles",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
