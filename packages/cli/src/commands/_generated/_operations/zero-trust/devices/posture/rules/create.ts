/** @generated from zero-trust.devices.posture.rules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture`,
	body: "json",
} as const;
