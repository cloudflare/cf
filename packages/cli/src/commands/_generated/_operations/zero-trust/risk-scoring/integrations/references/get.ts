/** @generated from dlp-zt-risk-score-integration-get-by-reference-id */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/integrations/reference_id/${request.reference_id}`,
} as const;
