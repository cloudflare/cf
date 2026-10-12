/** @generated from cloudflare-tunnel-get-a-cloudflare-tunnel-token */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}/token`,
} as const;
