/** @generated from spectrum-applications-get-spectrum-application-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps/${request.app_id}`,
} as const;
