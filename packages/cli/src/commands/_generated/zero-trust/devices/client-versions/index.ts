import $list from "./list.js";
import $targetenvironments from "./target-environments/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * client-versions command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "client-versions",
	describe: "Operations for devices.client-versions",

	builder: (yargs) => {
		return yargs
			.command($list)
			.command($targetenvironments)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
