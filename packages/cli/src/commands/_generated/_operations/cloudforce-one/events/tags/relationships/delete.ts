/** @generated from cloudforce-one.events.tags.relationships.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/${request.tag_uuid}/relationships/${request.rel_uuid}`,
	query: ["datasetId"],
	errors: {
		400: "BadRequestError",
	},
} as const;
