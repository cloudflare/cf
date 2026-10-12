/** @generated from smart-shield-create-health-check */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/healthchecks`,
	body: "json",
} as const;
