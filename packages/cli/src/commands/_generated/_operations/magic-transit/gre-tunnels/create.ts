/** @generated from magic-transit.gre-tunnels.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/gre_tunnels`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;
