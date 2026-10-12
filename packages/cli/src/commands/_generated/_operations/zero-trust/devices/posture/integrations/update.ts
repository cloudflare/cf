/** @generated from device-posture-integrations-update-device-posture-integration */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/integration/${request.integration_id}`,
	body: "json",
} as const;
