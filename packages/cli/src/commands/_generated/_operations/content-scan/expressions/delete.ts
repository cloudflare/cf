/** @generated from waf-content-scanning-delete-custom-scan-expressions */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/content-upload-scan/payloads/${request.expression_id}`,
} as const;
