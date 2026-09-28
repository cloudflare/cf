import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * security-txt command
 * @generated from apis/overlays/security-txt.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "security-txt",
	describe:
		"Manage the /.well-known/security.txt file that tells security researchers how to report vulnerabilities",

	builder: (yargs) => {
		return yargs
			.command($delete)
			.command($get)
			.command($update)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
