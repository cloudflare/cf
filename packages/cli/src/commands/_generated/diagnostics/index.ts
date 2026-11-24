import $endpointhealthchecks from "./endpoint-healthchecks/index.js";
import $traceroutes from "./traceroutes/index.js";
/**
 * diagnostics command
 * @generated from apis/overlays/diagnostics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "diagnostics",
	describe:
		"Network diagnostic tools — traceroutes from Cloudflare's edge and endpoint health checks",

	routes: {
		"endpoint-healthchecks": $endpointhealthchecks,
		traceroutes: $traceroutes,
	},
});

export default command;
