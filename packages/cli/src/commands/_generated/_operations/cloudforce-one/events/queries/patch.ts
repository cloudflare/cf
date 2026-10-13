/** @generated from cloudforce-one.events.queries.patch */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/queries/${request.query_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
