import $list from "./list.js";
import $tests from "./tests/index.js";
import $trend from "./trend.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pages command group
 * @generated from apis/overlays/speed.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pages",
	describe:
		"Tested pages with their performance history, trends, and individual test results",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($trend)
			.command($tests)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
