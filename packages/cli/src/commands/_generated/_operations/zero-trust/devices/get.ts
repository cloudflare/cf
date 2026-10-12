/** @generated from get-device */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/physical-devices/${request.device_id}`,
	query: ["include"],
} as const;
