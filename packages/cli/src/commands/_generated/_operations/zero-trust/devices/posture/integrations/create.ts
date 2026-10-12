/** @generated from device-posture-integrations-create-device-posture-integration */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/integration`,
	body: "json",
} as const;
