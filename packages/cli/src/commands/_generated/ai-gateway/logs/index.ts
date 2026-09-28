import $delete from "./delete.js";
import $getrequest from "./get-request.js";
import $getresponse from "./get-response.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * logs command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "logs",
	describe:
		"Inspect, annotate, and delete gateway request logs stored by Legacy Logs",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($getrequest)
			.command($getresponse)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
