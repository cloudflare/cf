/** @generated from ip-address-management-list-leases */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/leases`,
} as const;
