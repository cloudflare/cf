/** @generated from cloudforce-one.events.indicators.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/indicators`,
	query: [
		"datasetIds",
		"page",
		"pageSize",
		"search",
		"name",
		"indicatorType",
		"relatedEvents",
		"tags",
		"tagSearch",
		"createdAfter",
		"createdBefore",
		"relatedEventsLimit",
		"includeTags",
		"includeTotalCount",
		"format",
		"cache",
		"cursor",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
