/** @generated from health-checks-delete-preview-health-check */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks/preview/${request.healthcheck_id}`,
} as const;
