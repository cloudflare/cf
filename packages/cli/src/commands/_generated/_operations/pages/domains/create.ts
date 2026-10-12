/** @generated from pages-domains-add-domain */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/domains`,
	body: "json",
} as const;
