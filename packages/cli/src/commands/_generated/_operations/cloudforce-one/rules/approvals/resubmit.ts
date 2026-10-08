/** @generated from cloudforce-one.rules.approvals.resubmit */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/rules/approvals/{id}/resubmit",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
