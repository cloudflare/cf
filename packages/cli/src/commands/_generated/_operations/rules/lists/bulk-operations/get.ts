/** @generated from rules.lists.bulk-operations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rules/lists/bulk_operations/${request.operation_id}`,
} as const;
