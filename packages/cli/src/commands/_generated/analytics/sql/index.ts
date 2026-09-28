import $get from "./get.js";
import $introspection from "./introspection/index.js";
import $post from "./post.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * sql command group
 * @generated from apis/overlays/analytics.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "sql",
	describe: "Operations for sql",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($post)
			.command($introspection)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
