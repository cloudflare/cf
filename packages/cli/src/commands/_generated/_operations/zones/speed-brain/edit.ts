/** @generated from zones.speed-brain.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/speed_brain`,
	body: "json",
} as const;
