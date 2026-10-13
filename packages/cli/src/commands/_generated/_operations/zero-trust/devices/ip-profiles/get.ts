/** @generated from zero-trust.devices.ip-profiles.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/ip-profiles/${request.profile_id}`,
} as const;
