/** @generated from get-accounts-account_id-logpush-transformers */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logpush/transformers`,
} as const;
