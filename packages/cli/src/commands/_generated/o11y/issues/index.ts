import $add from "./add.js";
import $automations from "./automations/index.js";
import $get from "./get.js";
import $group from "./group.js";
import $list from "./list.js";
import $notify from "./notify.js";
import $occurrences from "./occurrences.js";
import $remove from "./remove.js";
import $summary from "./summary.js";
import $ungroup from "./ungroup.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * issues command group
 * @generated from apis/overlays/o11y.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "issues",
	describe: "Operations for issues",

	builder: (yargs) => {
		return yargs
			.command($add)
			.command($get)
			.command($group)
			.command($list)
			.command($notify)
			.command($occurrences)
			.command($remove)
			.command($summary)
			.command($ungroup)
			.command($update)
			.command($automations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
