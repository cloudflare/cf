import $get from "./get.js";
import $graphql from "./graphql.js";
import $raw from "./raw/index.js";
import $references from "./references/index.js";
import $tags from "./tags/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * legacy command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "legacy",
	describe: "Operations for threat-intel.events.legacy",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($graphql)
			.command($raw)
			.command($references)
			.command($tags)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
