import $getcanbeenabled from "./get-can-be-enabled.js";
import $querycanbeenabled from "./query-can-be-enabled.js";
import $setcanbeenabled from "./set-can-be-enabled.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zones command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zones",
	describe: "Operations for zones",

	builder: (yargs) => {
		return yargs
			.command($getcanbeenabled)
			.command($querycanbeenabled)
			.command($setcanbeenabled)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
