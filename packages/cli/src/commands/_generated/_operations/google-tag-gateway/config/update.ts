/** @generated from google-tag-gateway.config.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/google-tag-gateway/config`,
	body: "json",
} as const;
