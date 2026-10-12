/** @generated from cloudflare-tunnel-delete-a-warp-connector-tunnel */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}`,
} as const;
