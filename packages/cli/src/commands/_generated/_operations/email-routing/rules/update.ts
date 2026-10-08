/** @generated from email-routing.rules.update */
export default {
	method: "PUT",
	path: "/zones/{zone_id}/email/routing/rules/{rule_identifier}",
	body: "json",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
	},
} as const;
