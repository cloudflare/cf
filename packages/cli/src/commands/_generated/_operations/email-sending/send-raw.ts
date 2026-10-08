/** @generated from email-sending.send-raw */
export default {
	method: "POST",
	path: "/accounts/{account_id}/email/sending/send_raw",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
