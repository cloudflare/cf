import $edit from "./edit.js";
import $get from "./get.js";
import $nameserversets from "./nameserver-sets/index.js";
import $views from "./views/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account command group
 * @generated from apis/overlays/dns.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account",
	describe: "Operations for settings.account",

	builder: (yargs) => {
		return yargs
			.command($edit)
			.command($get)
			.command($nameserversets)
			.command($views)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
