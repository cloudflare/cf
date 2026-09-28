import $get from "./get.js";
import $patch from "./patch.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * automatic-upgrader command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "automatic-upgrader",
	describe:
		"SSL automatic mode enrollment — get or update automatic SSL/TLS upgrader settings",

	builder: (yargs) => {
		return yargs
			.command($get)
			.command($patch)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
