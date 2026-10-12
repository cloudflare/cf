/** @generated from api-shield-settings-retrieve-information-about-specific-configuration-properties */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/configuration`,
	query: ["normalize"],
} as const;
