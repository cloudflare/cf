/** @generated from pages-deployment-get-deployments */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/deployments`,
	query: ["env", "page", "per_page"],
} as const;
