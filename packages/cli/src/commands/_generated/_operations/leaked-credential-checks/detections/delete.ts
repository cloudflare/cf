/** @generated from leaked-credential-checks.detections.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks/detections/${request.detection_id}`,
} as const;
