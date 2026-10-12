/** @generated from pages-project-connect-project-source */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/source`,
	body: "json",
} as const;
