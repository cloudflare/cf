import $topn from "./top-n.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * content-findings command group
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "content-findings",
	describe: "Operations for query.data-security.content-findings",

	builder: (yargs) => {
		return yargs.command($topn).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
