/** @generated from delete_GroupDelete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups/${request.group_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
