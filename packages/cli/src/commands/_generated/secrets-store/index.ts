import $quota from "./quota/index.js";
import $secrets from "./secrets/index.js";
import $stores from "./stores/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * secrets-store command
 * @generated from apis/overlays/secrets-store.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "secrets-store",
	describe:
		"Centralized secret management — store API keys, tokens, and credentials for use across Workers and other products",

	builder: (yargs) => {
		return yargs
			.command($quota)
			.command($secrets)
			.command($stores)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
