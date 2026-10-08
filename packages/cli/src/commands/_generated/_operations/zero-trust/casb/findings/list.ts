/** @generated from zero-trust.casb.findings.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/data-security/posture/findings",
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
	},
} as const;
