/** @generated from email-routing-settings-email-routing-dns-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/dns`,
	query: ["subdomain"],
	errors: {
		403: "ForbiddenError",
	},
} as const;
