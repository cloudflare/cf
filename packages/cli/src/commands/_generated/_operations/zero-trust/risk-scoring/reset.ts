/** @generated from dlp-risk-score-reset-post */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/${request.user_id}/reset`,
} as const;
