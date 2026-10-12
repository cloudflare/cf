/** @generated from lists-get-lists */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists`,
} as const;
