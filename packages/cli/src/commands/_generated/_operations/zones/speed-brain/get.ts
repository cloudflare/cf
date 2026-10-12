/** @generated from zone-settings-get-speed-brain-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/speed_brain`,
} as const;
