/** @generated from zones.automatic-platform-optimization.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/automatic_platform_optimization`,
	body: "json",
} as const;
