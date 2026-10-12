/** @generated from network.routes.cidr.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/routes`,
	query: [
		"comment",
		"is_deleted",
		"network_subset",
		"network_superset",
		"existed_at",
		"tunnel_id",
		"route_id",
		"tun_types",
		"virtual_network_id",
		"per_page",
		"page",
	],
} as const;
