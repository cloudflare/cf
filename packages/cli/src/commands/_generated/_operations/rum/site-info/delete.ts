/** @generated from web-analytics-delete-site */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/${request.site_id}`,
} as const;
