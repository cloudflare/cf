/** @generated from healthchecks.previews.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks/preview/${request.healthcheck_id}`,
} as const;
