/** @generated from waf-product-api-leaked-credentials-create-detection */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks/detections`,
	body: "json",
} as const;
