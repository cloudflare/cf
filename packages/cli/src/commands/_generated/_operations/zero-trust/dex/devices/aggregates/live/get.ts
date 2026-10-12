/** @generated from dex-fleet-status-live */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/fleet-status/live`,
	query: ["since_minutes"],
} as const;
