import $listsupported from "./list-supported.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * regions command group
 * @generated from apis/overlays/cache.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "regions",
	describe: "Operations for origin-cloud-regions.regions",

	builder: (yargs) => {
		return yargs
			.command($listsupported)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
