/** @generated from magic-transit.sites.lans.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/lans/${request.lan_id}`,
} as const;
