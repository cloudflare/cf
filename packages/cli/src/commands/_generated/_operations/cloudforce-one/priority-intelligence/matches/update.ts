/** @generated from cloudforce-one.priority-intelligence.matches.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/${request.priority_id}/matches`,
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
