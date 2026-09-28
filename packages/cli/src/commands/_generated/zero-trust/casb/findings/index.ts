import $export from "./export.js";
import $get from "./get.js";
import $ignore from "./ignore.js";
import $instances from "./instances/index.js";
import $list from "./list.js";
import $resetseverity from "./reset-severity.js";
import $tuneseverity from "./tune-severity.js";
import $unignore from "./unignore.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * findings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "findings",
	describe: "Operations for casb.findings",

	builder: (yargs) => {
		return yargs
			.command($export)
			.command($get)
			.command($ignore)
			.command($list)
			.command($resetseverity)
			.command($tuneseverity)
			.command($unignore)
			.command($instances)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
