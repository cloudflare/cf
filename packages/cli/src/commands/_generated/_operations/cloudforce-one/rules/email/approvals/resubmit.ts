/** @generated from cloudforce-one.rules.email.approvals.resubmit */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured/approvals/{id}/resubmit",
	query: ["module"],
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
