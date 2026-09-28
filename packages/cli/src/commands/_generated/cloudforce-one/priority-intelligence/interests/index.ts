import $backtests from "./backtests/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $evaluations from "./evaluations/index.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * interests command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "interests",
	describe: "Operations for priority-intelligence.interests",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($list)
			.command($update)
			.command($backtests)
			.command($evaluations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
