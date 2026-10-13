/** @generated from secrets-store.secrets.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secrets_store/stores/${request.store_id}/secrets/${request.secret_id}`,
} as const;
