import $origincloudregions from "./origin-cloud-regions/index.js";
import $purgeenvironment from "./purge-environment.js";
import $purge from "./purge.js";
import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * cache command
 * @generated from apis/overlays/cache.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "cache",
	describe:
		"Purge cached content and configure Cache Reserve, tiered caching, and variant serving",

	builder: (yargs) => {
		return yargs
			.command($purge)
			.command($purgeenvironment)
			.command($origincloudregions)
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
