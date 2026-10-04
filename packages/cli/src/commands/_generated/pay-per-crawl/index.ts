import $config from "./config/index.js";
import $crawler from "./crawler/index.js";
import $crawlers from "./crawlers/index.js";
import $publisher from "./publisher/index.js";
import $terms from "./terms/index.js";
import $zones from "./zones/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * pay-per-crawl command
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "pay-per-crawl",
	describe: "pay-per-crawl",

	builder: (yargs) => {
		return yargs
			.command($config)
			.command($crawler)
			.command($crawlers)
			.command($publisher)
			.command($terms)
			.command($zones)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
