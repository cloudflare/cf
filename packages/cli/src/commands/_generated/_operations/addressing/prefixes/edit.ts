/** @generated from ip-address-management-prefixes-update-prefix-description */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}`,
	body: "json",
} as const;
