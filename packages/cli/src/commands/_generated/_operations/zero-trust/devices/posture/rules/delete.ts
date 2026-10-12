/** @generated from device-posture-rules-delete-device-posture-rule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/${request.rule_id}`,
} as const;
