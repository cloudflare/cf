import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * invites command group
 * @generated from apis/overlays/organizations.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "invites",
	describe: "Invitations to join an organization",

	builder: (yargs) => {
		return yargs
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
