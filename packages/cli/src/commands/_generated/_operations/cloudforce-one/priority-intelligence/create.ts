/** @generated from post_PirCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence`,
	body: "json",
	response: false,
	errors: {
		403: "ForbiddenError",
		429: "TooManyRequestsError",
	},
} as const;
