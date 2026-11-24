import $integrations from "./integrations/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * risk-scoring command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "risk-scoring",
	describe: "Operations for risk-scoring",

	builder: (yargs) => {
		return yargs
			.command($integrations)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
