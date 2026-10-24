/** @generated from zero-trust.casb.findings.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/data-security/posture/findings`,
	query: [
		"cursor",
		"direction",
		"ignored",
		"integration_id",
		"max_affliction_date",
		"min_affliction_date",
		"observation",
		"order",
		"page",
		"per_page",
		"product",
		"search",
		"severity",
		"type",
		"vendor",
		"finding_type_ids",
	],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		429: "TooManyRequestsError",
	},
} as const;
