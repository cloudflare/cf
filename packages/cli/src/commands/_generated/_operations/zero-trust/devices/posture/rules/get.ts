/** @generated from zero-trust.devices.posture.rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/posture/${request.rule_id}`,
} as const;
