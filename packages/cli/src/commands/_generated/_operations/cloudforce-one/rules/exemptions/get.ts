/** @generated from cloudforce-one.rules.exemptions.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/rules/exemptions",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
