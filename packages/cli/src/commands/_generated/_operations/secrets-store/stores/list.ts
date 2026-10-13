/** @generated from secrets-store.stores.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secrets_store/stores`,
	query: ["direction", "page", "per_page", "order"],
} as const;
