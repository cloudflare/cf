import $issuetypes from "./issue-types/index.js";
import $issues from "./issues/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * attack-surface-report command group
 * @generated from apis/overlays/intel.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "attack-surface-report",
	describe:
		"Attack surface intelligence — exposed assets, vulnerabilities, and infrastructure mapping",

	builder: (yargs) => {
		return yargs
			.command($issuetypes)
			.command($issues)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
