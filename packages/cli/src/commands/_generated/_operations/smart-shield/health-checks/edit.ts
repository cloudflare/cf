/** @generated from smart-shield.health-checks.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/healthchecks/${request.healthcheck_id}`,
	body: "json",
} as const;
