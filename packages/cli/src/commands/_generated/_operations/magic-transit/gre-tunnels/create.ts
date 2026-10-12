/** @generated from magic-gre-tunnels-create-gre-tunnels */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/gre_tunnels`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;
