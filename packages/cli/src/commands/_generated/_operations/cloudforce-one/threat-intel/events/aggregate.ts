/** @generated from cloudforce-one.threat-intel.events.aggregate */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/aggregate`,
	query: [
		"aggregateBy",
		"datasetId",
		"startDate",
		"endDate",
		"groupByDate",
		"limit",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
