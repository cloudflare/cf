/** @generated from tunnel-virtual-network-update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/virtual_networks/${request.virtual_network_id}`,
	body: "json",
} as const;
