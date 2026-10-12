/** @generated from cloudforce-one.priority-intelligence.interests.evaluations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests/evaluations/${request.evaluation_id}`,
	response: false,
	errors: {
		404: "NotFoundError",
	},
} as const;
