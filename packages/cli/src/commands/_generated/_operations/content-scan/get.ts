/** @generated from content-scan.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/content-upload-scan/settings`,
} as const;
