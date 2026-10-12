/** @generated from cloudflare-tunnel-list-warp-connector-tunnel-connections */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}/connections`,
} as const;
