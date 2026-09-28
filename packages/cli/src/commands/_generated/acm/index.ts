import $customtruststore from "./custom-trust-store/index.js";
import $totaltls from "./total-tls/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * acm command
 * @generated from apis/overlays/acm.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "acm",
	describe: "acm",

	builder: (yargs) => {
		return yargs
			.command($customtruststore)
			.command($totaltls)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
