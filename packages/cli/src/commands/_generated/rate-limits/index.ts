import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * rate-limits command
 * @generated from apis/overlays/rate-limits.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "rate-limits",
	describe:
		"Legacy per-zone rate limiting rules — prefer Advanced Rate Limiting in Rulesets for new configurations",

	builder: (yargs) => {
		return yargs

			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
