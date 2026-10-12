/** @generated from magic-site-lans-lan-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/lans/${request.lan_id}`,
} as const;
