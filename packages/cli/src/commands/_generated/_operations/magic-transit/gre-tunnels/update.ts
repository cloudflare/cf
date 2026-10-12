/** @generated from magic-transit.gre-tunnels.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/gre_tunnels/${request.gre_tunnel_id}`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;
