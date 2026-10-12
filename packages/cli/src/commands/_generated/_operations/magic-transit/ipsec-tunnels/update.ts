/** @generated from magic-ipsec-tunnels-update-ipsec-tunnel */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels/${request.ipsec_tunnel_id}`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;
