/** @generated from pages-domains-patch-domain */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pages/projects/${request.project_name}/domains/${request.domain_name}`,
} as const;
