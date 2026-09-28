import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * recommendations command group
 * @generated from apis/overlays/ssl.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "recommendations",
	describe:
		"Get the recommended SSL/TLS encryption mode based on your origin server's certificate configuration",

	builder: (yargs) => {
		return yargs.command($get).demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
