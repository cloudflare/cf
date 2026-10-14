/** @generated from healthchecks.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks/${request.healthcheck_id}`,
	body: "json",
} as const;
