/** @generated from secrets-store.secrets.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secrets_store/stores/${request.store_id}/secrets`,
	body: "json",
} as const;
