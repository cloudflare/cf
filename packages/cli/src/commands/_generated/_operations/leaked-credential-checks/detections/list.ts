/** @generated from waf-product-api-leaked-credentials-list-detections */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks/detections`,
} as const;
