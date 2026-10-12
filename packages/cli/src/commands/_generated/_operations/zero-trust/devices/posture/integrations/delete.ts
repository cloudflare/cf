/** @generated from device-posture-integrations-delete-device-posture-integration */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/integration/${request.integration_id}`,
} as const;
