/** @generated from cloudflare-tunnel-get-cloudflare-tunnel-connector */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}/connectors/${request.connector_id}`,
} as const;
