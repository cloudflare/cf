/** @generated from leaked-credential-checks.detections.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks/detections/${request.detection_id}`,
	body: "json",
} as const;
