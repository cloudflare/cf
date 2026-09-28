import $analytics from "./analytics/index.js";
import $apps from "./apps/index.js";
import $livestreams from "./livestreams/index.js";
import $meetings from "./meetings/index.js";
import $presets from "./presets/index.js";
import $recordings from "./recordings/index.js";
import $sessions from "./sessions/index.js";
import $webhooks from "./webhooks/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * kit command group
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "kit",
	describe:
		"SDK-backed meetings, participants, recordings, livestreams, and webhooks",

	builder: (yargs) => {
		return yargs
			.command($analytics)
			.command($apps)
			.command($livestreams)
			.command($meetings)
			.command($presets)
			.command($recordings)
			.command($sessions)
			.command($webhooks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
