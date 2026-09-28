import $config from "./config/index.js";
import $default from "./default/index.js";
import $export from "./export/index.js";
import $history from "./history/index.js";
import $publish from "./publish/index.js";
import $workflow from "./workflow/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zaraz command
 * @generated from apis/overlays/zaraz.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zaraz",
	describe:
		"Server-side tag manager — load third-party tools (analytics, pixels, etc.) from Cloudflare's edge without client-side JS",

	builder: (yargs) => {
		return yargs
			.command($config)
			.command($default)
			.command($export)
			.command($history)
			.command($publish)
			.command($workflow)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
