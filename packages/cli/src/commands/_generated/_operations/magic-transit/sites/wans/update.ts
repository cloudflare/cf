/** @generated from magic-transit.sites.wans.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/wans/${request.wan_id}`,
	body: "json",
} as const;
