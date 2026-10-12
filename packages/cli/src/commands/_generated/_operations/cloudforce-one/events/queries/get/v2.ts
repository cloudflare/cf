/** @generated from cloudforce-one.events.queries.get.v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/queries/${request.query_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
