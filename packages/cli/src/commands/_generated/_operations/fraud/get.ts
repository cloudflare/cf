/** @generated from fraud.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/fraud_detection/settings`,
} as const;
