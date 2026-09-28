import $kit from "./kit/index.js";
import $moq from "./moq/index.js";
import $sfu from "./sfu/index.js";
import $turn from "./turn/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * realtime command
 * @generated from apis/overlays/realtime.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "realtime",
	describe:
		"Real-time audio, video, and data services on Cloudflare's global network",

	builder: (yargs) => {
		return yargs
			.command($kit)
			.command($moq)
			.command($sfu)
			.command($turn)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
