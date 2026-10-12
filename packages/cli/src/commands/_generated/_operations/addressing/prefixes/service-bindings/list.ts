/** @generated from ip-address-management-service-bindings-list-service-bindings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bindings`,
} as const;
