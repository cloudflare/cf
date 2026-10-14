/** @generated from zero-trust.devices.profiles.custom.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/policies`,
	query: ["profile_type"],
} as const;
