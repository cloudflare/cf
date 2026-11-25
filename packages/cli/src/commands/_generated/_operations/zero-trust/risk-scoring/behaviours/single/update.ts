/** @generated from zero-trust.risk-scoring.behaviours.single.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/behaviors/${request.behavior_id}`,
	body: "json",
} as const;
