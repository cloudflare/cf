import $source from "./source.js";
import $target from "./target.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * connectivity-precheck command group
 * @generated from apis/overlays/r2.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "connectivity-precheck",
	describe: "Operations for super-slurper.connectivity-precheck",

	builder: (yargs) => {
		return yargs
			.command($source)
			.command($target)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
