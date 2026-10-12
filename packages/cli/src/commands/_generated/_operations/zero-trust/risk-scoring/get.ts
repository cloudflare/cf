/** @generated from dlp-risk-score-summary-get-for-user */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/${request.user_id}`,
} as const;
