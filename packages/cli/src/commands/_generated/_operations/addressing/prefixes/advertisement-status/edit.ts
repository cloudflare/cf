/** @generated from addressing.prefixes.advertisement-status.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bgp/status`,
	body: "json",
} as const;
