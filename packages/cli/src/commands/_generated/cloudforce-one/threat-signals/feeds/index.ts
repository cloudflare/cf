import $create from "./create.js";
import $delete from "./delete.js";
import $getraw from "./get-raw.js";
import $list from "./list.js";
import $poll from "./poll.js";
import $skills from "./skills/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * feeds command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "feeds",
	describe: "Operations for threat-signals.feeds",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($getraw)
			.command($list)
			.command($poll)
			.command($update)
			.command($skills)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
