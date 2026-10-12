/** @generated from update-ip-profile */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/ip-profiles/${request.profile_id}`,
	body: "json",
} as const;
