/** @generated from cloudforce-one.threat-events.search */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events`,
	query: ["forceRefresh", "format", "cache"],
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
