/** @generated from waf-content-scanning-list-custom-scan-expressions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/content-upload-scan/payloads`,
} as const;
