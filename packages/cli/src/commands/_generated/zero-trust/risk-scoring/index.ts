import $behaviours from "./behaviours/index.js";
import $get from "./get.js";
import $integrations from "./integrations/index.js";
import $reset from "./reset.js";
import $summary from "./summary/index.js";
/**
 * risk-scoring command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "risk-scoring",
	describe: "User Risk Scoring - retrieve and reset user risk scores",

	routes: {
		get: $get,
		reset: $reset,
		behaviours: $behaviours,
		integrations: $integrations,
		summary: $summary,
	},
});

export default command;
