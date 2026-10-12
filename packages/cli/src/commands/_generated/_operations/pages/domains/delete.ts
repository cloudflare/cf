/** @generated from pages-domains-delete-domain */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/domains/${request.domain_name}`,
} as const;
