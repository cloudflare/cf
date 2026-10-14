/** @generated from zero-trust.dex.devices.over-time.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/${request.device_id}/fleet-status/over-time`,
	query: ["from", "to", "interval", "colo"],
} as const;
