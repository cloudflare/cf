/** @generated from dns.domainconnect.get-domain-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/v2/${request.domain}/settings`,
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
