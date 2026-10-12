/** @generated from ip-address-management-prefix-delegation-create-prefix-delegation */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/delegations`,
	body: "json",
} as const;
