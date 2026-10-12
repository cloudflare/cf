/** @generated from ip-address-management-prefixes-fetch-bgp-prefix */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bgp/prefixes/${request.bgp_prefix_id}`,
} as const;
