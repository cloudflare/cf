/** @generated from cloudforce-one.rules.exemptions.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/rules/exemptions",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
	},
} as const;
