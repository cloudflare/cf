/** @generated from zones.image-resizing.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/image_resizing`,
	body: "json",
} as const;
