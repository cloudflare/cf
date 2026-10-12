/** @generated from email-sending.subdomains.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains/${request.subdomain_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
