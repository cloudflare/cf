/** @generated from device-posture-rules-list-device-posture-rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture`,
} as const;
