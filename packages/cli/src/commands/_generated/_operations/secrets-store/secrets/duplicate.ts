/** @generated from secrets-store-duplicate-by-id */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secrets_store/stores/${request.store_id}/secrets/${request.secret_id}/duplicate`,
	body: "json",
} as const;
