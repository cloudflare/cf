import $create from "./create.js";
import $delete from "./delete.js";
import $dns from "./dns/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $preview from "./preview.js";
import $reputation from "./reputation/index.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * subdomains command group
 * @generated from apis/overlays/email-sending.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "subdomains",
	describe: "Configure sending subdomains and keep their DNS records healthy",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($preview)
			.command($update)
			.command($dns)
			.command($reputation)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
