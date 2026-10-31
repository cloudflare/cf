/** @generated from cloudforce-one.threat-intel.tags.indicators.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/${request.tag_uuid}/indicators`,
	query: [
		"datasetIds",
		"page",
		"pageSize",
		"indicatorType",
		"relatedEvent",
		"search",
	],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
