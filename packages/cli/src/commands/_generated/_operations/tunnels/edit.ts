/** @generated from tunnels.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}`,
	body: "json",
} as const;
