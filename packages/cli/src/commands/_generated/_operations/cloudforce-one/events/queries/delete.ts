/** @generated from delete_EventQueryDelete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/queries/${request.query_id}`,
	response: false,
	errors: {
		404: "NotFoundError",
	},
} as const;
