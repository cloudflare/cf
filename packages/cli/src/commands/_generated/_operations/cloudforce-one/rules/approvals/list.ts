/** @generated from cloudforce-one.rules.approvals.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/rules/approvals`,
	query: [
		"status",
		"latest_only",
		"limit",
		"offset",
		"reviewer_scope",
		"change_type",
		"rule_id",
	],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
	},
} as const;
