/** @generated from waf-content-scanning-add-custom-scan-expressions */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/content-upload-scan/payloads`,
	body: "json",
} as const;
