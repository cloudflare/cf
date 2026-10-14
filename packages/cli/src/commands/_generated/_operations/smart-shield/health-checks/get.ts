/** @generated from smart-shield.health-checks.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/healthchecks/${request.healthcheck_id}`,
} as const;
