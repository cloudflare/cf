/** @generated from zero-trust.access.logs.access-requests.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/logs/access_requests`,
	query: [
		"limit",
		"direction",
		"since",
		"until",
		"page",
		"per_page",
		"email",
		"email_exact",
		"user_id",
		"allowedOp",
		"country_codeOp",
		"app_typeOp",
		"app_uidOp",
		"ray_idOp",
		"emailOp",
		"idpOp",
		"non_identityOp",
		"user_idOp",
		"fields",
	],
} as const;
