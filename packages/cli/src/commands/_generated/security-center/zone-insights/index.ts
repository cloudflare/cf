import $context from "./context/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zone-insights command group
 * @generated from apis/overlays/security-center.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zone-insights",
	describe:
		"Zone-scoped security insights — counts by class, severity, type, and dismissal",

	builder: (yargs) => {
		return yargs
			.command($context)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
