/** @generated from device-managed-networks-delete-device-managed-network */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/networks/${request.network_id}`,
} as const;
