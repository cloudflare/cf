/** @generated from pages-deployment-get-deployment-info */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/deployments/${request.deployment_id}`,
} as const;
