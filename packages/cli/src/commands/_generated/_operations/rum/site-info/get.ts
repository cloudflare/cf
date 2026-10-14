/** @generated from rum.site-info.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/${request.site_id}`,
} as const;
