/** @generated from tunnels.hostnames.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tunnels/${request.tunnel_id}/hostnames`,
	body: "json",
} as const;
