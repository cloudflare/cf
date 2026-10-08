/** @generated from email-routing.rules.create */
export default {
	method: "POST",
	path: "/zones/{zone_id}/email/routing/rules",
	body: "json",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
	},
} as const;
