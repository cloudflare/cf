/** @generated from magic-site-lans-patch-lan */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}/lans/${request.lan_id}`,
	body: "json",
} as const;
