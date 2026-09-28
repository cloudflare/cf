import $regionaltieredcache from "./regional-tiered-cache/index.js";
import $reserve from "./reserve/index.js";
import $smarttieredcache from "./smart-tiered-cache/index.js";
import $variants from "./variants/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * settings command group
 * @generated from apis/overlays/cache.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "settings",
	describe: "Configure Cache Reserve, tiered caching, and variant serving",

	builder: (yargs) => {
		return yargs
			.command($regionaltieredcache)
			.command($reserve)
			.command($smarttieredcache)
			.command($variants)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
