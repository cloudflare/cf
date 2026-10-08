/** @generated from monetization.rules.edit */
export default {
	method: "PATCH",
	path: "/zones/{zone_id}/monetization/rules/{rule_id}",
	body: "json",
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
