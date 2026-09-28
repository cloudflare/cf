import $create from "./create.js";
import $delete from "./delete.js";
import $disable from "./disable.js";
import $enable from "./enable.js";
import $get from "./get.js";
import $list from "./list.js";
import $outputs from "./outputs/index.js";
import $rotatekeys from "./rotate-keys.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * live-inputs command group
 * @generated from apis/overlays/stream.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "live-inputs",
	describe: "Enable and disable live input streams",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($disable)
			.command($enable)
			.command($get)
			.command($list)
			.command($rotatekeys)
			.command($update)
			.command($outputs)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
