/** @generated from magic-gre-tunnels-update-multiple-gre-tunnels */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/gre_tunnels`,
	headers: ["x-magic-new-hc-target"],
	body: "json",
} as const;
