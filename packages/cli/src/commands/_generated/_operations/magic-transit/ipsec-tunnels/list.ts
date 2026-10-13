/** @generated from magic-transit.ipsec-tunnels.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels`,
	headers: ["x-magic-new-hc-target"],
} as const;
