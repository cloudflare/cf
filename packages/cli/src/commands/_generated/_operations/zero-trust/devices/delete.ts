/** @generated from delete-device */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/physical-devices/${request.device_id}`,
} as const;
