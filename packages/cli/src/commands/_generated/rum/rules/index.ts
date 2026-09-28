import $bulkcreate from "./bulk-create.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rules command group
 * @generated from apis/overlays/rum.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rules",
	describe:
		"Rules that control which pages and paths are tracked by Web Analytics",

	builder: (yargs) => {
		return yargs
			.command($bulkcreate)
			.command($create)
			.command($delete)
			.command($list)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
