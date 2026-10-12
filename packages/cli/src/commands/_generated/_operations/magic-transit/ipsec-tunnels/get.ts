/** @generated from magic-ipsec-tunnels-list-ipsec-tunnel-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels/${request.ipsec_tunnel_id}`,
	headers: ["x-magic-new-hc-target"],
} as const;
