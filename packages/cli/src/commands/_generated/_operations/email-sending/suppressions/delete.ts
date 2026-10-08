/** @generated from email-sending.suppressions.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/email/sending/suppressions/{suppression_id}",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
