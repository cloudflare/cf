/** @generated from ip-address-management-service-bindings-get-service-binding */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bindings/${request.binding_id}`,
} as const;
