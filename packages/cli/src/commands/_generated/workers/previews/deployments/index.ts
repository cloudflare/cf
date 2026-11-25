import $profile from "./profile.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * deployments command group
 * @generated from apis/overlays/workers.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "deployments",
	describe: "Operations for previews.deployments",

	builder: (yargs) => {
		return yargs
			.command($profile)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
