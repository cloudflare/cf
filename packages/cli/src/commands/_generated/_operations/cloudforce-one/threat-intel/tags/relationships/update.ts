/** @generated from cloudforce-one.threat-intel.tags.relationships.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/${request.tag_uuid}/relationships/${request.rel_uuid}`,
	query: ["datasetId"],
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
