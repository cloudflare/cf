import $bots from "./bots/index.js";
import $inference from "./inference/index.js";
import $markdownforagents from "./markdown-for-agents/index.js";
import $timeseriesgroups from "./timeseries-groups/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ai command group
 * @generated from apis/overlays/radar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ai",
	describe:
		"AI inference trends and model usage statistics across the Cloudflare network",

	builder: (yargs) => {
		return yargs
			.command($bots)
			.command($inference)
			.command($markdownforagents)
			.command($timeseriesgroups)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
