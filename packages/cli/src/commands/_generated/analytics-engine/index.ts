import $sql from "./sql/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * analytics-engine command
 * @generated from apis/overlays/analytics-engine.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "analytics-engine",
	describe: "analytics-engine",

	builder: (yargs) => {
		return yargs.command($sql).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
