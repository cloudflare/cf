/** @generated from zero-trust.cws.deployments.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/deployments/${request.deployment_id}`,
} as const;
