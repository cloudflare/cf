/** @generated from cloudforce-one.threat-intel.tags.relationships.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/${request.tag_uuid}/relationships`,
	query: ["datasets", "search", "expand", "cursor", "pageSize"],
	errors: {
		400: "BadRequestError",
	},
} as const;
