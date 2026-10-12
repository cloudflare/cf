/** @generated from magic-ipsec-tunnels-set-pre-shared-keys-for-ipsec-tunnels */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels/psk`,
	query: ["validate_only"],
	body: "json",
} as const;
