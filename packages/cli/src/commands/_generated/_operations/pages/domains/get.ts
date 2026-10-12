/** @generated from pages-domains-get-domain */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/domains/${request.domain_name}`,
} as const;
