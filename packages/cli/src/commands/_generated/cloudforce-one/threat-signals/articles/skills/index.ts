import $getoutput from "./get-output.js";
import $list from "./list.js";
import $run from "./run.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * skills command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "skills",
	describe: "Operations for threat-signals.articles.skills",

	builder: (yargs) => {
		return yargs
			.command($getoutput)
			.command($list)
			.command($run)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
