/** @generated from cloudforce-one.threat-intel.events.relationships.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/by-id/${request.event_id}/relationships`,
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
