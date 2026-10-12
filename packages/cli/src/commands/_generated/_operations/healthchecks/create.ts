/** @generated from health-checks-create-health-check */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks`,
	body: "json",
} as const;
