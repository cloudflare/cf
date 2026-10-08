/** @generated from browser-run.quick-action.accessibility-tree */
export default {
	method: "POST",
	path: "/accounts/{account_id}/browser-rendering/accessibilityTree",
	query: ["cacheTTL", "browser"],
	body: "json",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
