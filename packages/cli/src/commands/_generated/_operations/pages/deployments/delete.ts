/** @generated from pages-deployment-delete-deployment */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/deployments/${request.deployment_id}`,
	query: ["force"],
} as const;
