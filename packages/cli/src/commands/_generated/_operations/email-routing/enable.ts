/** @generated from email-routing-settings-enable-email-routing-dns */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/dns`,
	body: "json",
	errors: {
		403: "ForbiddenError",
	},
} as const;
