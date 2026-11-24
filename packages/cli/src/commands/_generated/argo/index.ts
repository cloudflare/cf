import $smartrouting from "./smart-routing/index.js";
import $tieredcaching from "./tiered-caching/index.js";
/**
 * argo command
 * @generated from apis/overlays/argo.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "argo",
	describe:
		"Network optimization features that speed up and improve reliability of traffic to your origins",

	routes: {
		"smart-routing": $smartrouting,
		"tiered-caching": $tieredcaching,
	},
});

export default command;
