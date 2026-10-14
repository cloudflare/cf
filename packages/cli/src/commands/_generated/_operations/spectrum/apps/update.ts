/** @generated from spectrum.apps.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps/${request.app_id}`,
	body: "json",
} as const;
