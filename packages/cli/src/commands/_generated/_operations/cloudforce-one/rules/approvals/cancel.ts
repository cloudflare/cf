/** @generated from cloudforce-one.rules.approvals.cancel */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/rules/approvals/{id}/cancel",
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
