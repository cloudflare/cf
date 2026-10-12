/** @generated from magic-gre-tunnels-list-gre-tunnel-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/gre_tunnels/${request.gre_tunnel_id}`,
	headers: ["x-magic-new-hc-target"],
} as const;
