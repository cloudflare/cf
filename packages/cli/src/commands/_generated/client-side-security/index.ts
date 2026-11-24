import $connections from "./connections/index.js";
import $cookies from "./cookies/index.js";
import $policies from "./policies/index.js";
import $scripts from "./scripts/index.js";
import $settings from "./settings/index.js";
/**
 * client-side-security command
 * @generated from apis/overlays/client-side-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "client-side-security",
	describe:
		"Client-Side Security — monitor JavaScript, connections, and cookies on your pages for supply-chain attacks",

	routes: {
		connections: $connections,
		cookies: $cookies,
		policies: $policies,
		scripts: $scripts,
		settings: $settings,
	},
});

export default command;
