/** @generated from magic-site-wans-wan-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/wans/${request.wan_id}`,
} as const;
