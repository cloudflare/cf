import $pool from "./pool.js";
import $pools from "./pools.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pools command group
 * @generated from apis/overlays/user.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pools",
	describe: "Load Balancers operations",

	builder: (yargs) => {
		return yargs
			.command($pool)
			.command($pools)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
