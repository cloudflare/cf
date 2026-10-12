/** @generated from tunnels.connectors.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}/connectors/${request.connector_id}`,
} as const;
