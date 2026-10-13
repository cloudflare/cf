/** @generated from zero-trust.risk-scoring.behaviours.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/behaviors`,
	body: "json",
} as const;
