/** @generated from dex-fleet-status-over-time */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/fleet-status/over-time`,
	query: ["to", "from", "colo", "device_id"],
} as const;
