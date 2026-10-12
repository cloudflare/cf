/** @generated from zone-settings-change-image-resizing-setting */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/image_resizing`,
	body: "json",
} as const;
