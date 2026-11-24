import $quota from "./quota/index.js";
import $secrets from "./secrets/index.js";
import $stores from "./stores/index.js";
/**
 * secrets-store command
 * @generated from apis/overlays/secrets-store.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "secrets-store",
	describe:
		"Centralized secret management — store API keys, tokens, and credentials for use across Workers and other products",

	routes: {
		quota: $quota,
		secrets: $secrets,
		stores: $stores,
	},
});

export default command;
