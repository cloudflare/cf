/** @generated from zero-trust.cws.deployments.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/deployments/${request.deployment_id}`,
} as const;
