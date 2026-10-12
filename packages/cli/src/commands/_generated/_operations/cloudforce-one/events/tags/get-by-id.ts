/** @generated from cloudforce-one.events.tags.get-by-id */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/${request.tag_uuid}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
