import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * tenant-custom-nameservers command
 * @generated from apis/overlays/tenant-custom-nameservers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "tenant-custom-nameservers",
	describe: "tenant-custom-nameservers",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
