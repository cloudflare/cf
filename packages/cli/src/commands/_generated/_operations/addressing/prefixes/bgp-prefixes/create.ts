/** @generated from ip-address-management-prefixes-create-bgp-prefix */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bgp/prefixes`,
	body: "json",
} as const;
