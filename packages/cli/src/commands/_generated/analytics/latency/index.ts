import $colos from "./colos/index.js";
import $get from "./get.js";
/**
 * latency command group
 * @generated from apis/overlays/analytics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "latency",
	describe:
		"Argo Smart Routing latency analytics showing time-to-first-byte improvements",

	routes: {
		get: $get,
		colos: $colos,
	},
});

export default command;
