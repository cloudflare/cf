import $histogram from "./histogram.js";
import $summary from "./summary.js";
import $top from "./top/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * speed command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "speed",
	describe: "Operations for quality.speed",

	builder: (yargs) => {
		return yargs
			.command($histogram)
			.command($summary)
			.command($top)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
