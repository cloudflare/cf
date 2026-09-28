import $articles from "./articles/index.js";
import $categories from "./categories/index.js";
import $curatedfeeds from "./curated-feeds/index.js";
import $feeds from "./feeds/index.js";
import $health from "./health.js";
import $indicators from "./indicators/index.js";
import $skills from "./skills/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * threat-signals command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "threat-signals",
	describe: "Operations for threat-signals",

	builder: (yargs) => {
		return yargs
			.command($health)
			.command($articles)
			.command($categories)
			.command($curatedfeeds)
			.command($feeds)
			.command($indicators)
			.command($skills)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
