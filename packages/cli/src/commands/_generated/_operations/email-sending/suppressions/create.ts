/** @generated from email-sending.suppressions.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/email/sending/suppressions",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
