/** @generated from device-posture-rules-device-posture-rules-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/${request.rule_id}`,
} as const;
