import $extensions from "./extensions/index.js";
import $registrations from "./registrations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * registrar command
 * @generated from apis/overlays/registrar.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "registrar",
	describe: "registrar",

	builder: (yargs) => {
		return yargs
			.command($extensions)
			.command($registrations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
