import $build from "#commands/containers/build/index.js";
import $push from "#commands/containers/push/index.js";
import $ssh from "#commands/containers/ssh/index.js";
import { withHandWrittenDryRun } from "#lib/hand-written-dry-run.js";
import $applications from "./applications/index.js";
import $images from "./images/index.js";
import $registries from "./registries/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * containers command
 * @generated from apis/overlays/containers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "containers",
	describe:
		"Deploy and manage Containers applications on Cloudflare's global network",

	builder: (yargs) => {
		return yargs
			.command(withHandWrittenDryRun($build, "preview"))
			.command(withHandWrittenDryRun($push, "preview"))
			.command(withHandWrittenDryRun($ssh, "preview"))
			.command($applications)
			.command($images)
			.command($registries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
