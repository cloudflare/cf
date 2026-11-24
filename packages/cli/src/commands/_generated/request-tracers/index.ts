import $traces from "./traces/index.js";
/**
 * request-tracers command
 * @generated from apis/overlays/request-tracers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "request-tracers",
	describe:
		"Trace how a request would be processed through Cloudflare's rules and configuration pipeline",

	routes: {
		traces: $traces,
	},
});

export default command;
