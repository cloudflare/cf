/** @generated from device-managed-networks-device-managed-network-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/networks/${request.network_id}`,
} as const;
