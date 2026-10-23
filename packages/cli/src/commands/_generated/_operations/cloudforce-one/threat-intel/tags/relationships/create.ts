/** @generated from cloudforce-one.threat-intel.tags.relationships.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/${request.tag_uuid}/relationships`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
