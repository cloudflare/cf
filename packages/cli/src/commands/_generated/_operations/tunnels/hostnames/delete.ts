/** @generated from tunnels.hostnames.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tunnels/${request.tunnel_id}/hostnames/${request.hostname_id}`,
} as const;
