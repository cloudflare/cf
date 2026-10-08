/** @generated from email-routing.rules.plan */
export default {
	method: "POST",
	path: "/accounts/{account_id}/email/routing/rules/plan",
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		422: "UnprocessableEntityError",
	},
} as const;
