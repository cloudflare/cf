/** @generated from cloudforce-one.events.relationships.legacy.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/${request.event_id}/relationships`,
	query: [
		"direction",
		"maxDepth",
		"relationshipTypes",
		"indicatorTypeIds",
		"datasetId",
		"includeParent",
		"page",
		"pageSize",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
