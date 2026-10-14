/** @generated from leaked-credential-checks.detections.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/leaked-credential-checks/detections`,
	body: "json",
} as const;
