/** @generated from dlp-risk-score-behaviors-put */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/behaviors`,
	body: "json",
} as const;
