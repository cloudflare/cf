/** @generated from cloudflare-tunnel-configuration-get-warp-connector-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}/configurations`,
} as const;
