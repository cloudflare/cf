/** @generated from spectrum-applications-delete-spectrum-application */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps/${request.app_id}`,
} as const;
