/** @generated from addressing.prefixes.delegations.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/delegations`,
	body: "json",
} as const;
