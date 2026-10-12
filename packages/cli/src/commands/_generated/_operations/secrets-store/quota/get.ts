/** @generated from secrets-store.quota.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secrets_store/quota`,
} as const;
