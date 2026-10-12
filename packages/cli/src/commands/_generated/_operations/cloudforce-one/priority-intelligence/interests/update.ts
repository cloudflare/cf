/** @generated from patch_PirInterestUpdate */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests/${request.interest_id}`,
	body: "json",
	response: false,
	errors: {
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
