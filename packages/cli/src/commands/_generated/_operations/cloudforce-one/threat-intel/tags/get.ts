/** @generated from cloudforce-one.threat-intel.tags.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/${request.tag_uuid}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
