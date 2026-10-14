/** @generated from zero-trust.risk-scoring.integrations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/integrations/${request.integration_id}`,
} as const;
