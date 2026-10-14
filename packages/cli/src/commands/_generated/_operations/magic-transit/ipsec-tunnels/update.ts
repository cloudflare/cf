/** @generated from magic-transit.ipsec-tunnels.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels/${request.ipsec_tunnel_id}`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;
