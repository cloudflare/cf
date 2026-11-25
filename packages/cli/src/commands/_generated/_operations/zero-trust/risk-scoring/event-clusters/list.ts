/** @generated from zero-trust.risk-scoring.event-clusters.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/${request.user_id}/event_clusters`,
	query: ["timestamp.between", "time_zone", "page", "per_page"],
} as const;
