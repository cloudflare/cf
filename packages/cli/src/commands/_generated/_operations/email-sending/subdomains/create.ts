/** @generated from email-sending-subdomains-create-sending-subdomain */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains`,
	body: "json",
	errors: {
		403: "ForbiddenError",
	},
} as const;
