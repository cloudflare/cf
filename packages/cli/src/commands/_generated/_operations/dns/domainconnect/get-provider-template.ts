/** @generated from dns.domainconnect.get-provider-template */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/v2/domainTemplates/providers/${request.provider}/services/${request.service}`,
	query: ["dump"],
	errors: {
		404: "NotFoundError",
	},
} as const;
