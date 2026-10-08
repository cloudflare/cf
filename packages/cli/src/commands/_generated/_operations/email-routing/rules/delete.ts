/** @generated from email-routing.rules.delete */
export default {
	method: "DELETE",
	path: "/zones/{zone_id}/email/routing/rules/{rule_identifier}",
	errors: {
		404: "NotFoundError",
	},
} as const;
