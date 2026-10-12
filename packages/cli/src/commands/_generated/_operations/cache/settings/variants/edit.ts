/** @generated from cache.settings.variants.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/variants`,
	body: "json",
} as const;
