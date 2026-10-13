/** @generated from magic-transit.sites.acls.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/acls`,
	body: "json",
} as const;
