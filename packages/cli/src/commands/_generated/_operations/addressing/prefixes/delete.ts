/** @generated from addressing.prefixes.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes/${request.prefix_id}`,
} as const;
