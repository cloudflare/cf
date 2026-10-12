/** @generated from zero-trust.cws.deployments.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/deployments/${request.deployment_id}`,
	body: "json",
} as const;
