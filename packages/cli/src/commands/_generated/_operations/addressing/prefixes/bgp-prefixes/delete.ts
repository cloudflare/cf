/** @generated from addressing.prefixes.bgp-prefixes.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bgp/prefixes/${request.bgp_prefix_id}`,
} as const;
