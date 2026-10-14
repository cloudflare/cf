/** @generated from magic-transit.sites.acls.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/acls/${request.acl_id}`,
} as const;
