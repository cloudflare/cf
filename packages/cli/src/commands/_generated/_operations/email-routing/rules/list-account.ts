/** @generated from email-routing.rules.list-account */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/email/routing/rules",
	query: ["page", "per_page", "enabled"],
	errors: {
		403: "ForbiddenError",
	},
} as const;
