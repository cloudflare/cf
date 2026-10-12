/** @generated from cloudflare-tunnel-configuration-get-configuration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}/configurations`,
} as const;
