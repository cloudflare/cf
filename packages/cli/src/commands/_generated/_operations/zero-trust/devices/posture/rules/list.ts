/** @generated from zero-trust.devices.posture.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture`,
} as const;
