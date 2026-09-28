import $logs from "./logs/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * history command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "history",
	describe: "Operations for projects.deployments.history",

	builder: (yargs) => {
		return yargs.command($logs).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
