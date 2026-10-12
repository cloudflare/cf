/** @generated from zone-purge */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/purge_cache`,
	body: "json",
} as const;
