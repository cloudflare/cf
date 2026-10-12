/** @generated from network.virtual-networks.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/virtual_networks`,
	query: ["id", "name", "is_default", "is_default_network", "is_deleted"],
} as const;
