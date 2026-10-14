/** @generated from workers.deployments.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts/${request.script_name}/deployments/${request.deployment_id}`,
} as const;
