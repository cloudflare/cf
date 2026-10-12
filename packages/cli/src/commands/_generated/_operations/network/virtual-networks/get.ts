/** @generated from network.virtual-networks.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/virtual_networks/${request.virtual_network_id}`,
} as const;
