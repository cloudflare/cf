import $event from "./event.js";
import $v2 from "./v2.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * get command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "get",
	describe: "Operations for events.queries.get",

	builder: (yargs) => {
		return yargs
			.command($event)
			.command($v2)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
