import $extensions from "./extensions/index.js";
import $registrations from "./registrations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * registrar-sandbox command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "registrar-sandbox",
	describe: "registrar-sandbox",

	builder: (yargs) => {
		return yargs
			.command($extensions)
			.command($registrations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
