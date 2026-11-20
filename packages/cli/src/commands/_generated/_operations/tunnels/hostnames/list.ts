/** @generated from tunnels.hostnames.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tunnels/${request.tunnel_id}/hostnames`,
	query: ["hostname", "canonical", "is_deleted", "per_page", "page"],
} as const;
