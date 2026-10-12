/** @generated from waf-product-api-leaked-credentials-delete-detection */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks/detections/${request.detection_id}`,
} as const;
