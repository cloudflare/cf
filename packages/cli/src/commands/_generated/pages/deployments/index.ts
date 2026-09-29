import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $history from "./history/index.js";
import $list from "./list.js";
import $retry from "./retry.js";
import $rollback from "./rollback.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * deployments command group
 * @generated from apis/overlays/pages.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "deployments",
	describe: "Operations for deployments",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($retry)
			.command($rollback)
			.command($history)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
