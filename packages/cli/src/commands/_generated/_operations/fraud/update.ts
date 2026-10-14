/** @generated from fraud.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/fraud_detection/settings`,
	body: "json",
} as const;
