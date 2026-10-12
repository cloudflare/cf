/** @generated from cloudflare-tunnel-update-a-warp-connector-tunnel */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}`,
	body: "json",
} as const;
