/** @generated from cloudforce-one.rules.approvals.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/rules/approvals/{id}",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
