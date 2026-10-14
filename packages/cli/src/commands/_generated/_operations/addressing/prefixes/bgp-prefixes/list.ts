/** @generated from addressing.prefixes.bgp-prefixes.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bgp/prefixes`,
} as const;
