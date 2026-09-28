import $create from "./create.js";
import $delete from "./delete.js";
import $disable from "./disable.js";
import $enable from "./enable.js";
import $forcenotify from "./force-notify.js";
import $get from "./get.js";
import $status from "./status/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * outgoing command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "outgoing",
	describe: "Operations for zone-transfers.outgoing",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($disable)
			.command($enable)
			.command($forcenotify)
			.command($get)
			.command($update)
			.command($status)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
