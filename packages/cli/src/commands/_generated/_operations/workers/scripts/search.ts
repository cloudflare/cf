/** @generated from worker-script-search-workers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts-search`,
	query: ["name", "id", "order_by", "page", "per_page"],
} as const;
