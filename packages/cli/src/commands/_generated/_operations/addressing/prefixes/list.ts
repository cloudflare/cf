/** @generated from ip-address-management-prefixes-list-prefixes */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes`,
} as const;
