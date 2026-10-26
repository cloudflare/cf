import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $verify from "./verify.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * email-domains command
 * @generated from apis/overlays/email-domains.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "email-domains",
	describe: "email-domains",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($verify)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
