import $keys from "./keys/index.js";
import $liveinputs from "./live-inputs/index.js";
import $storageusage from "./storage-usage.js";
import $videos from "./videos/index.js";
import $watermarks from "./watermarks/index.js";
import $webhooks from "./webhooks/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * stream command
 * @generated from apis/overlays/stream.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "stream",
	describe:
		"Video encoding, storage, and delivery — upload, live-stream, clip, caption, and embed video at scale",

	builder: (yargs) => {
		return yargs
			.command($storageusage)
			.command($keys)
			.command($liveinputs)
			.command($videos)
			.command($watermarks)
			.command($webhooks)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
