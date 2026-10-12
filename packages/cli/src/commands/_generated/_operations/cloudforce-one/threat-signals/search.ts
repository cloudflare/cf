/** @generated from cloudforce-one.threat-signals.search */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/search`,
	query: ["query", "max_results", "feed_id"],
} as const;
