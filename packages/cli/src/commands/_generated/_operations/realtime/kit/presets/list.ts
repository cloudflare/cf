/** @generated from realtime.kit.presets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/presets`,
	query: ["per_page", "page_no", "search"],
} as const;
