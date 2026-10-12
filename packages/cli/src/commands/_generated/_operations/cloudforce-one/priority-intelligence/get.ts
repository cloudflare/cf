/** @generated from get_PirGet */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/${request.priority_id}`,
	response: false,
	errors: {
		404: "NotFoundError",
	},
} as const;
