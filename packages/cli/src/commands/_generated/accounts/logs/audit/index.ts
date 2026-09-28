import $history from "./history.js";
import $list from "./list.js";
import $productcategories from "./product-categories.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * audit command group
 * @generated from apis/overlays/accounts.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "audit",
	describe: "Operations for logs.audit",

	builder: (yargs) => {
		return yargs
			.command($history)
			.command($list)
			.command($productcategories)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
