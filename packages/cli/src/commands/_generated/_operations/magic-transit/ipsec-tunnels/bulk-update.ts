/** @generated from magic-ipsec-tunnels-update-multiple-ipsec-tunnels */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/ipsec_tunnels`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;
