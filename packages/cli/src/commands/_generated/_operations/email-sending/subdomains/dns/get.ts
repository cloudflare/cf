/** @generated from email-sending-subdomains-get-sending-subdomain-dns */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains/${request.subdomain_id}/dns`,
	errors: {
		404: "NotFoundError",
	},
} as const;
