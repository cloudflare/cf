/** @generated from magic-transit.gre-tunnels.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/gre_tunnels/${request.gre_tunnel_id}`,
	headers: ["x-magic-new-hc-target"],
} as const;
