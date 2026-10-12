/** @generated from zone-environment-purge */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/environments/${request.environment_id}/purge_cache`,
	body: "json",
} as const;
