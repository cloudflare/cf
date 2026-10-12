/** @generated from dlp-zt-risk-score-integration-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/integrations`,
	body: "json",
	constants: {
		integration_type: "Okta",
	},
} as const;
