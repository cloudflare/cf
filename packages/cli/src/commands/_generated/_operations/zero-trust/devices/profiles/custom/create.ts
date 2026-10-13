/** @generated from zero-trust.devices.profiles.custom.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policy`,
	body: "json",
} as const;
