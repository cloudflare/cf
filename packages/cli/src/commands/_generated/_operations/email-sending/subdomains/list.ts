/** @generated from email-sending-subdomains-list-sending-subdomains */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
