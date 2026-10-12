/** @generated from zero-trust.devices.override-codes.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/${request.device_id}/override_codes`,
} as const;
