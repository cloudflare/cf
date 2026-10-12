/** @generated from email-sending.subdomains.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains/${request.subdomain_id}`,
	body: "json",
	errors: {
		404: "NotFoundError",
	},
} as const;
