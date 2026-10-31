/** @generated from cloudforce-one.priority-intelligence.matches.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/${request.priority_id}/matches`,
	query: ["cursor", "per_page", "triage_state"],
	response: false,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
