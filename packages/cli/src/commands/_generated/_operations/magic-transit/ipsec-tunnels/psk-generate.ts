/** @generated from magic-ipsec-tunnels-generate-pre-shared-key-(-psk)-for-ipsec-tunnels */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels/${request.ipsec_tunnel_id}/psk_generate`,
} as const;
