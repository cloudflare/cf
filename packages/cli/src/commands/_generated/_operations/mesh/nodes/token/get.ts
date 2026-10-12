/** @generated from cloudflare-tunnel-get-a-warp-connector-tunnel-token */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}/token`,
} as const;
