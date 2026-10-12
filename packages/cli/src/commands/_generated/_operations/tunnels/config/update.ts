/** @generated from cloudflare-tunnel-configuration-put-configuration */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}/configurations`,
	body: "json",
} as const;
