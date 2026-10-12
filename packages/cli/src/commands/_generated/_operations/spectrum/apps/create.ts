/** @generated from spectrum-applications-create-spectrum-application-using-a-name-for-the-origin */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/spectrum/apps`,
	body: "json",
} as const;
