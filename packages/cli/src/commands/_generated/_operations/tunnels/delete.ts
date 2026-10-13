/** @generated from tunnels.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel/${request.tunnel_id}`,
} as const;
