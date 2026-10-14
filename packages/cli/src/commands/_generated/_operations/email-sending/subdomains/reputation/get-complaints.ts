/** @generated from email-sending.subdomains.reputation.get-complaints */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/sending/subdomains/${request.subdomain_id}/reputation/complaints`,
	query: ["start_at", "end_at"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		422: "UnprocessableEntityError",
		502: "BadGatewayError",
	},
} as const;
