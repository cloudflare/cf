/** @generated from waf-content-scanning-update-settings */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/content-upload-scan/settings`,
	body: "json",
} as const;
