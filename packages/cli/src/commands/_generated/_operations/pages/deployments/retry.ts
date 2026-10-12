/** @generated from pages-deployment-retry-deployment */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/deployments/${request.deployment_id}/retry`,
} as const;
