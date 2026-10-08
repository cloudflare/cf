/** @generated from email-sending.suppressions.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/email/sending/suppressions/{suppression_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
