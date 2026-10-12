/** @generated from email-sending-subdomains-preview-sending-subdomain */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains/preview`,
	body: "json",
	errors: {
		403: "ForbiddenError",
	},
} as const;
