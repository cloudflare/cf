/** @generated from health-checks-delete-health-check */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks/${request.healthcheck_id}`,
} as const;
