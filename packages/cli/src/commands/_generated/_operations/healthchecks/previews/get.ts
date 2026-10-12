/** @generated from health-checks-health-check-preview-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks/preview/${request.healthcheck_id}`,
} as const;
