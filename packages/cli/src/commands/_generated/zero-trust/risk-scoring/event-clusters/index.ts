import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * event-clusters command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "event-clusters",
	describe: "User Risk Scoring - list daily clusters of user risk events",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
