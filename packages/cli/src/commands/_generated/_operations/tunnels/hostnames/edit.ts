/** @generated from tunnels.hostnames.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tunnels/${request.tunnel_id}/hostnames/${request.hostname_id}`,
	body: "json",
} as const;
