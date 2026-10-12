/** @generated from put_PirUpdate */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/${request.priority_id}`,
	body: "json",
	response: false,
	errors: {
		404: "NotFoundError",
	},
} as const;
