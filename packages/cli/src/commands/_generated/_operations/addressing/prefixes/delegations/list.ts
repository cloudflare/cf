/** @generated from ip-address-management-prefix-delegation-list-prefix-delegations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/delegations`,
} as const;
