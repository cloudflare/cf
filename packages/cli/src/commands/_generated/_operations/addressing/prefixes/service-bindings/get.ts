/** @generated from addressing.prefixes.service-bindings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bindings/${request.binding_id}`,
} as const;
