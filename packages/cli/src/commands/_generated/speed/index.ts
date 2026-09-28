import $availabilities from "./availabilities/index.js";
import $pages from "./pages/index.js";
import $schedule from "./schedule/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * speed command
 * @generated from apis/overlays/speed.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "speed",
	describe:
		"Observatory speed tests — run Lighthouse audits, track performance trends, and schedule recurring tests",

	builder: (yargs) => {
		return yargs
			.command($availabilities)
			.command($pages)
			.command($schedule)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
