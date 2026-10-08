/** @generated from email-routing.rules.catch-all.update */
export default {
	method: "PUT",
	path: "/zones/{zone_id}/email/routing/rules/catch_all",
	body: "json",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
	},
} as const;
