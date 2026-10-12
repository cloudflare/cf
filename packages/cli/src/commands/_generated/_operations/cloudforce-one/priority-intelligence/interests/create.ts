/** @generated from cloudforce-one.priority-intelligence.interests.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests`,
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
