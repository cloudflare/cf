/** @generated from email-sending.subdomains.create */
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
