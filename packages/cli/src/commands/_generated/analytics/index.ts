import $latency from "./latency/index.js";
import $query from "./query/index.js";
/**
 * analytics command
 * @generated from apis/overlays/analytics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "analytics",
	describe:
		"Zone-level traffic analytics — dashboard summaries, per-colo breakdowns, and Argo latency metrics",

	routes: {
		latency: $latency,
		query: $query,
	},
});

export default command;
