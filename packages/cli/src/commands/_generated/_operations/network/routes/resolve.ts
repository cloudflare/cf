/** @generated from tunnel-route-get-tunnel-route-by-ip */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/routes/ip/${request.ip}`,
	query: ["virtual_network_id", "default_virtual_network_fallback"],
} as const;
