/** @generated from email-routing.rules.list-account */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/email/routing/rules`,
	query: ["page", "per_page", "enabled"],
	errors: {
		403: "ForbiddenError",
	},
} as const;
