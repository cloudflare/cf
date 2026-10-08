/** @generated from browser-run.quick-action.pdf */
export default {
	method: "POST",
	path: "/accounts/{account_id}/browser-rendering/pdf",
	query: ["cacheTTL", "browser"],
	body: "json",
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
