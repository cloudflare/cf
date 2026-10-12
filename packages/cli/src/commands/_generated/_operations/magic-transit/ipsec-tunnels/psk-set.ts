/** @generated from magic-transit.ipsec-tunnels.psk-set */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels/psk`,
	query: ["validate_only"],
	body: "json",
} as const;
