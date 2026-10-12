/** @generated from post_GroupCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/dataset/-/groups`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
