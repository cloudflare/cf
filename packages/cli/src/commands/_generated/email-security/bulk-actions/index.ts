import $cancel from "./cancel.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $messages from "./messages/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * bulk-actions command group
 * @generated from apis/overlays/email-security.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "bulk-actions",
	describe:
		"Asynchronous jobs that move or release every message matching a search — create, monitor, and manage bulk jobs",

	builder: (yargs) => {
		return yargs
			.command($cancel)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($messages)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
