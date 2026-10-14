/** @generated from cloudforce-one.priority-intelligence.interests.evaluations.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests/evaluations`,
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
	},
} as const;
