import $allowlist from "./allowlist/index.js";
import $prefixes from "./prefixes/index.js";
import $syn from "./syn/index.js";
import $tcp from "./tcp/index.js";
/**
 * configs command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "configs",
	describe: "Operations for advanced-tcp-protection.configs",

	routes: {
		allowlist: $allowlist,
		prefixes: $prefixes,
		syn: $syn,
		tcp: $tcp,
	},
});

export default command;
