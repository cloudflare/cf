/** @generated from zero-trust.devices.ip-profiles.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/ip-profiles`,
	body: "json",
} as const;
