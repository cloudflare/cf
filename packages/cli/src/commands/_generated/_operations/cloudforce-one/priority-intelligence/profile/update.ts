/** @generated from cloudforce-one.priority-intelligence.profile.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/profile`,
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
	},
} as const;
