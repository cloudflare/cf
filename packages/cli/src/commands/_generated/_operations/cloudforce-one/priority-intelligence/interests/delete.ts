/** @generated from cloudforce-one.priority-intelligence.interests.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests/${request.interest_id}`,
	response: false,
	errors: {
		404: "NotFoundError",
	},
} as const;
