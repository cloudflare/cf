/** @generated from email-routing.dns.get */
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
