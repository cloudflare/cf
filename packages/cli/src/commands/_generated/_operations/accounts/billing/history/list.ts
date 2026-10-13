/** @generated from accounts.billing.history.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/history`,
	query: ["page", "per_page", "status"],
} as const;
