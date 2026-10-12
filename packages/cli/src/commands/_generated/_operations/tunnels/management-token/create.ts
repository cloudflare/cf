/** @generated from cloudflare-tunnel-get-a-cloudflare-tunnel-management-token */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}/management`,
	body: "json",
} as const;
