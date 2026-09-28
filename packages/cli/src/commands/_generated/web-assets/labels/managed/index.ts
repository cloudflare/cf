import $get from "./get.js";
import $operations from "./operations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * managed command group
 * @generated from apis/overlays/web-assets.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "managed",
	describe: "Operations for labels.managed",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($operations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
