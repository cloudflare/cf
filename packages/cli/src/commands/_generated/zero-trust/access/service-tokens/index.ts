import $refresh from "./refresh.js";
import $rotate from "./rotate.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * service-tokens command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "service-tokens",
	describe: "Operations for access.service-tokens",

	builder: (yargs) => {
		return yargs
			.command($refresh)
			.command($rotate)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
