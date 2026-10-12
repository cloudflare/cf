/** @generated from get_GroupRead */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups/${request.group_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
