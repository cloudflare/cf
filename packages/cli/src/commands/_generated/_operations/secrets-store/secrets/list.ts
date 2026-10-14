/** @generated from secrets-store.secrets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secrets_store/stores/${request.store_id}/secrets`,
	query: ["direction", "page", "per_page", "search", "order", "scopes"],
	joined: ["scopes"],
} as const;
