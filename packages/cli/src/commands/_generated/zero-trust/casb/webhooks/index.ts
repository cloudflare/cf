import $create from "./create.js";
import $delete from "./delete.js";
import $evaluateexisting from "./evaluate-existing.js";
import $evaluate from "./evaluate.js";
import $get from "./get.js";
import $jobs from "./jobs/index.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * webhooks command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "webhooks",
	describe: "Operations for casb.webhooks",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($evaluate)
			.command($evaluateexisting)
			.command($get)
			.command($list)
			.command($update)
			.command($jobs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
