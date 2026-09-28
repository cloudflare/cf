import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * unique-devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "unique-devices",
	describe: "Operations for dex.overview.tests.unique-devices",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
