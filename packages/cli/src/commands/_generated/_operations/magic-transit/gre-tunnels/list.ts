/** @generated from magic-gre-tunnels-list-gre-tunnels */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/gre_tunnels`,
	headers: ["x-magic-new-hc-target"],
} as const;
