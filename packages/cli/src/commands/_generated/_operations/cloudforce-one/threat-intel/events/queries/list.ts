/** @generated from cloudforce-one.threat-intel.events.queries.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/queries`,
	errors: {
		500: "InternalServerError",
	},
} as const;
