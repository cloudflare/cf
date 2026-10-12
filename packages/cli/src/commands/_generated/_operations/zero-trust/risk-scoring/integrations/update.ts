/** @generated from dlp-zt-risk-score-integration-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/integrations/${request.integration_id}`,
	body: "json",
} as const;
