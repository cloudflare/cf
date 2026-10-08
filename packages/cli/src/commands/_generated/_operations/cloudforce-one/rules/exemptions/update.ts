/** @generated from cloudforce-one.rules.exemptions.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cloudforce-one/rules/exemptions",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
