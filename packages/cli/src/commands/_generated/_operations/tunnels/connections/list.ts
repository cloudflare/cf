/** @generated from cloudflare-tunnel-list-cloudflare-tunnel-connections */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}/connections`,
} as const;
