/** @generated from zero-trust.risk-scoring.integrations.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zt_risk_scoring/integrations/${request.integration_id}`,
} as const;
