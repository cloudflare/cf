/** @generated from ip-address-management-service-bindings-delete-service-binding */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bindings/${request.binding_id}`,
} as const;
