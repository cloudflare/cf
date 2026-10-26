import $aggregateall from "./aggregate-all.js";
import $aggregate from "./aggregate.js";
import $list from "./list.js";
import $series from "./series.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * matches command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "matches",
	describe: "Operations for priority-intelligence.matches",

	builder: (yargs) => {
		return yargs
			.command($aggregate)
			.command($aggregateall)
			.command($list)
			.command($series)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
