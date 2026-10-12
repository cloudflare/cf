/** @generated from addressing.prefixes.service-bindings.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}/bindings`,
	body: "json",
} as const;
