import $enablement from "./enablement/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ohttp-gateway command
 * @generated from apis/overlays/ohttp-gateway.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ohttp-gateway",
	describe: "ohttp-gateway",

	builder: (yargs) => {
		return yargs
			.command($enablement)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
