/** @generated from zero-trust.devices.ip-profiles.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/ip-profiles`,
	query: ["page", "per_page"],
} as const;
