/** @generated from spectrum-applications-update-spectrum-application-configuration-using-a-name-for-the-origin */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps/${request.app_id}`,
	body: "json",
} as const;
