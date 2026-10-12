/** @generated from zone-settings-get-image-resizing-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/image_resizing`,
} as const;
