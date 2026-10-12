import $bindings from "./bindings/index.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $secrets from "./secrets/index.js";
import $settings from "./settings/index.js";
import $tags from "./tags/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * scripts command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "scripts",
	describe: "Operations for dispatch-namespaces.scripts",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($list)
			.command($bindings)
			.command($secrets)
			.command($settings)
			.command($tags)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
