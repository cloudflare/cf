/** @generated from zero-trust.devices.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/physical-devices/${request.device_id}`,
	body: "json",
} as const;
