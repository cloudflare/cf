import $configautofill from "./config-autofill/index.js";
import $connections from "./connections/index.js";
/**
 * repos command group
 * @generated from apis/overlays/builds.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "repos",
	describe: "Manage source repository connections for Workers Builds.",

	routes: {
		"config-autofill": $configautofill,
		connections: $connections,
	},
});

export default command;
