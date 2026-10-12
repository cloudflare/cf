/** @generated from ip-address-management-dynamic-advertisement-get-advertisement-status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bgp/status`,
} as const;
