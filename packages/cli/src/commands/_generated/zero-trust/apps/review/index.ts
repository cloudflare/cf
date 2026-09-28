import $status from "./status/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * review command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "review",
	describe: "Operations for apps.review",

	builder: (yargs) => {
		return yargs
			.command($status)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
