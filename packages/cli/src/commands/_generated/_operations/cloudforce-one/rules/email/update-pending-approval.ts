/** @generated from cloudforce-one.rules.email.update-pending-approval */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cloudforce-one/rules/structured/approvals/{id}",
	query: ["module"],
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
