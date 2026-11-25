/** @generated from zero-trust.risk-scoring.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/${request.user_id}`,
	query: [
		"timestamp.between",
		"time_zone",
		"page",
		"per_page",
		"order_by",
		"direction",
	],
} as const;
