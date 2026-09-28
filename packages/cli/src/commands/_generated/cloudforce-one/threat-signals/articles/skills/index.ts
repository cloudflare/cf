import $diagnostic from "./diagnostic.js";
import $getoutput from "./get-output.js";
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
			.command($diagnostic)
			.command($getoutput)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
