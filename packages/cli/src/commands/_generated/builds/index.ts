import $cancel from "./cancel.js";
import $create from "./create.js";
import $deployhooks from "./deploy-hooks/index.js";
import $get from "./get.js";
import $limits from "./limits/index.js";
import $list from "./list.js";
import $logs from "./logs/index.js";
import $repos from "./repos/index.js";
import $tokens from "./tokens/index.js";
import $triggers from "./triggers/index.js";
import $versions from "./versions/index.js";
import $workers from "./workers/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * builds command
 * @generated from apis/overlays/builds.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "builds",
	describe:
		"Build and deploy Workers from connected repositories, then inspect build status and logs.",

	builder: (yargs) => {
		return yargs
			.command($cancel)
			.command($create)
			.command($get)
			.command($list)
			.command($deployhooks)
			.command($limits)
			.command($logs)
			.command($repos)
			.command($tokens)
			.command($triggers)
			.command($versions)
			.command($workers)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
