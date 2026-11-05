import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * enablement command group
 * @generated from apis/overlays/ohttp-gateway.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "enablement",
	describe: "Operations for enablement",

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
