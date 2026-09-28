import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rate-plans command group
 * @generated from apis/overlays/billing.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rate-plans",
	describe: "Operations for rate-plans",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
