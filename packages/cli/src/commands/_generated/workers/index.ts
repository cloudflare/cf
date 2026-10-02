import $delete from "./delete.js";
import $deployments from "./deployments/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $scripts from "./scripts/index.js";
import $secrets from "./secrets/index.js";
import $versions from "./versions/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * workers command
 * @generated from apis/overlays/workers.ts
 */
import type { CommandModule } from "yargs";
import $check from "#commands/workers/check/index.js";
import $triggers from "#commands/workers/triggers/index.js";
import $types from "#commands/workers/types/index.js";

const command: CommandModule<CommonYargsOptions> = {
	command: "workers",
	describe: "workers",

	builder: (yargs) => {
		return yargs
			.command($check)
			.command($delete)
			.command($get)
			.command($list)
			.command($types)
			.command($deployments)
			.command($scripts)
			.command($secrets)
			.command($triggers)
			.command($versions)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
