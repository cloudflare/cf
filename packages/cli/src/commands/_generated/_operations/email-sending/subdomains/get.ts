/** @generated from email-sending-subdomains-get-sending-subdomain */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains/${request.subdomain_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
