/** @generated from device-posture-integrations-device-posture-integration-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/integration/${request.integration_id}`,
} as const;
