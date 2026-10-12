/** @generated from pages-deployment-create-deployment */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/deployments`,
	pathParams: ["account_id", "project_name"],
	body: "form",
} as const;
