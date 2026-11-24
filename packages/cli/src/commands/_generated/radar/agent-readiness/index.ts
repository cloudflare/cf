import $summary from "./summary.js";
/**
 * agent-readiness command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "agent-readiness",
	describe: "Agent readiness summary statistics across the Cloudflare network",

	routes: {
		summary: $summary,
	},
});

export default command;
