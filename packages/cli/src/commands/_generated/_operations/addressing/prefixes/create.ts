/** @generated from addressing.prefixes.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/prefixes`,
	body: "json",
} as const;
