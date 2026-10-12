/** @generated from addressing.prefixes.bgp-prefixes.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bgp/prefixes/${request.bgp_prefix_id}`,
	body: "json",
} as const;
