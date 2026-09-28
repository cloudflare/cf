import $activate from "./activate.js";
import $close from "./close.js";
import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * targets command group
 * @generated from apis/overlays/browser-run.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "targets",
	describe: "Operations for devtools.browser.targets",

	builder: (yargs) => {
		return yargs
			.command($activate)
			.command($close)
			.command($create)
			.command($get)
			.command($list)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
