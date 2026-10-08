/** @generated from pay-per-use.usage-reports.submit */
export default {
	method: "POST",
	path: "/accounts/{account_id}/pay-per-use/usage-reports",
	body: "json",
	contentType: "application/jsonl",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		413: "ContentTooLargeError",
		415: "UnsupportedMediaTypeError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
