/** @generated from token-validation-rules-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/token_validation/rules`,
	query: [
		"per_page",
		"page",
		"token_configuration",
		"action",
		"enabled",
		"id",
		"rule_id",
		"host",
		"hostname",
	],
} as const;
