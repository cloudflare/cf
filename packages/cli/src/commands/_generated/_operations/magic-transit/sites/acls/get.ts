/** @generated from magic-site-acls-acl-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/acls/${request.acl_id}`,
} as const;
