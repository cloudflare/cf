/** @generated from alerting.history.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/history`,
	query: ["per_page", "before", "page", "since"],
} as const;
