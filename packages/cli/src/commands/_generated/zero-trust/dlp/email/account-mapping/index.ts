import $create from "./create.js";
import $get from "./get.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * account-mapping command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "account-mapping",
	describe:
		"Data Loss Prevention - configure account mappings for outbound email scanning",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
