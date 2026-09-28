import $top from "./top/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * robots-txt command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "robots-txt",
	describe: "Robots.txt adoption and crawler directive trends across the web",

	builder: (yargs) => {
		return yargs.command($top).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
