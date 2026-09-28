import $class from "./class.js";
import $dismiss from "./dismiss.js";
import $list from "./list.js";
import $severity from "./severity.js";
import $type from "./type.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * issues command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "issues",
	describe: "Operations for attack-surface-report.issues",

	builder: (yargs) => {
		return yargs
			.command($class)
			.command($dismiss)
			.command($list)
			.command($severity)
			.command($type)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
