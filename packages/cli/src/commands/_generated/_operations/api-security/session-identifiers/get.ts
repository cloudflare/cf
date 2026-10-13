/** @generated from api-security.session-identifiers.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/configuration`,
	query: ["normalize"],
} as const;
