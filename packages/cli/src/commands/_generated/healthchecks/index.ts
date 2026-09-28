import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $previews from "./previews/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * healthchecks command
 * @generated from apis/overlays/healthchecks.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "healthchecks",
	describe:
		"Standalone health checks that monitor origin server availability from Cloudflare's edge",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($update)
			.command($previews)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
