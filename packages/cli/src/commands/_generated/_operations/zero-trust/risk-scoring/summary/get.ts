/** @generated from zero-trust.risk-scoring.summary.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/summary`,
} as const;
