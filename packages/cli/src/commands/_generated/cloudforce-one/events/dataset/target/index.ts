import $industries from "./industries/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * target command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "target",
	describe: "Operations for events.dataset.target",

	builder: (yargs) => {
		return yargs
			.command($industries)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
