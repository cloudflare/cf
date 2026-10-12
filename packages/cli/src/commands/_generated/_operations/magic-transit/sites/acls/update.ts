/** @generated from magic-transit.sites.acls.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/acls/${request.acl_id}`,
	body: "json",
} as const;
