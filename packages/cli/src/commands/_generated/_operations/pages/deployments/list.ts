/** @generated from pages.deployments.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/deployments`,
	query: ["env", "page", "per_page"],
} as const;
