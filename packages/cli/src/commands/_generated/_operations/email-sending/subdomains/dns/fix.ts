/** @generated from email-sending-subdomains-fix-sending-subdomain-dns */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains/${request.subdomain_id}/dns`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
