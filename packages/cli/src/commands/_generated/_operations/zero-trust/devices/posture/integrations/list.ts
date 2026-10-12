/** @generated from device-posture-integrations-list-device-posture-integrations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/integration`,
} as const;
