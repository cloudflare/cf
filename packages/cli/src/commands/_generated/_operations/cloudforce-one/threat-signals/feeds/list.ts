/** @generated from cloudforce-one.threat-signals.feeds.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/feeds`,
	query: [
		"page",
		"per_page",
		"limit",
		"sort",
		"category",
		"source_type",
		"enabled",
		"status",
	],
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
