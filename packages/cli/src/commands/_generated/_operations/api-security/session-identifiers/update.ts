/** @generated from api-shield-settings-set-configuration-properties */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/configuration`,
	query: ["normalize"],
	body: "json",
} as const;
