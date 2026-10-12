/** @generated from pages-deployment-get-deployment-logs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/deployments/${request.deployment_id}/history/logs`,
} as const;
