/** @generated from magic-transit.sites.lans.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/lans/${request.lan_id}`,
	body: "json",
} as const;
