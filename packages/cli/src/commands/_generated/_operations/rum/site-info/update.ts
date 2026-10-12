/** @generated from web-analytics-update-site */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/${request.site_id}`,
	body: "json",
} as const;
