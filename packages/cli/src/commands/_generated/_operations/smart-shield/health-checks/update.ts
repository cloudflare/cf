/** @generated from smart-shield.health-checks.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/smart_shield/healthchecks/${request.healthcheck_id}`,
	body: "json",
	constants: {
		success: true,
	},
} as const;
