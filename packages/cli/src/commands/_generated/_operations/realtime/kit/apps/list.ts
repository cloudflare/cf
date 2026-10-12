/** @generated from realtime.kit.apps.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/apps`,
	query: ["page_no", "per_page", "search", "sort_order"],
} as const;
