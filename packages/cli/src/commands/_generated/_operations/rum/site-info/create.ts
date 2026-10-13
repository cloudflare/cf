/** @generated from rum.site-info.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info`,
	body: "json",
} as const;
