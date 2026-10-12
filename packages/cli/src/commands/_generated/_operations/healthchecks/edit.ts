/** @generated from health-checks-patch-health-check */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks/${request.healthcheck_id}`,
	body: "json",
} as const;
