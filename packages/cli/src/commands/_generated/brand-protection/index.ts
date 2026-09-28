import $logomatches from "./logo-matches/index.js";
import $logos from "./logos/index.js";
import $matches from "./matches/index.js";
import $queries from "./queries/index.js";
import $submit from "./submit.js";
import $trial from "./trial/index.js";
import $urlinfo from "./url-info.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * brand-protection command
 * @generated from apis/overlays/brand-protection.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "brand-protection",
	describe: "brand-protection",

	builder: (yargs) => {
		return yargs
			.command($submit)
			.command($urlinfo)
			.command($logomatches)
			.command($logos)
			.command($matches)
			.command($queries)
			.command($trial)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
