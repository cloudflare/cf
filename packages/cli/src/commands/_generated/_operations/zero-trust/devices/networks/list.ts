/** @generated from device-managed-networks-list-device-managed-networks */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/networks`,
} as const;
