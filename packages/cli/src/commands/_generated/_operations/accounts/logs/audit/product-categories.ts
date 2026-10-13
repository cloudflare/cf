/** @generated from accounts.logs.audit.product-categories */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logs/audit/product_categories`,
} as const;
