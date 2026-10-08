import $create from "./create.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * asset-new command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "asset-new",
	describe: "Operations for requests.v1.asset-new",

	builder: (yargs) => {
		return yargs
			.command($create)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
