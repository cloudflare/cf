/** @generated from zero-trust.dex.devices.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/${request.device_id}/fleet-status/live`,
	query: ["since_minutes", "time_now", "colo"],
} as const;
