/** @generated from rules.lists.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists`,
	body: "json",
} as const;
