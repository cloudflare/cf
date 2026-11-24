import $dispatchnamespaces from "./dispatch-namespaces/index.js";
/**
 * workers-for-platforms command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "workers-for-platforms",
	describe:
		"Workers for Platforms uses dispatch namespaces to isolate and route requests to many individual user Workers, letting platforms run untrusted customer or AI-generated code at scale with per-tenant bindings, limits, and observability",

	routes: {
		"dispatch-namespaces": $dispatchnamespaces,
	},
});

export default command;
