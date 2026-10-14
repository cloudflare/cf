/** @generated from email-security.domains.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/domains`,
	query: [
		"page",
		"per_page",
		"search",
		"order",
		"direction",
		"allowed_delivery_mode",
		"domain",
		"active_delivery_mode",
		"integration_id",
		"status",
	],
} as const;
