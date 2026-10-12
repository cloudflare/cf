/** @generated from get_publicListSendingSuppressions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/suppressions`,
	query: [
		"per_page",
		"cursor",
		"email",
		"search",
		"reason",
		"scope_type",
		"scope_value",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
