/** @generated from delete-ip-profile */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/ip-profiles/${request.profile_id}`,
} as const;
