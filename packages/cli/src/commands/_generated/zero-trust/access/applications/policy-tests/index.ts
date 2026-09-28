import $create from "./create.js";
import $get from "./get.js";
import $users from "./users/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * policy-tests command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "policy-tests",
	describe: "Operations for access.applications.policy-tests",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($get)
			.command($users)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
