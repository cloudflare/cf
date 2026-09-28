import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * warp-change-events command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "warp-change-events",
	describe: "Operations for dex.warp-change-events",

	builder: (yargs) => {
		return yargs.command($list).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
