/** @generated from cloudforce-one.threat-events.datasets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset`,
	query: ["includeDeleted"],
	errors: {
		400: "BadRequestError",
	},
} as const;
