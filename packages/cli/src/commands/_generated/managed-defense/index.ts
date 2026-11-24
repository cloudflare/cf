import $vulnerabilitydiscovery from "./vulnerability-discovery/index.js";
/**
 * managed-defense command
 * @generated from apis/overlays/managed-defense.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "managed-defense",
	describe: "managed-defense",

	routes: {
		"vulnerability-discovery": $vulnerabilitydiscovery,
	},
});

export default command;
