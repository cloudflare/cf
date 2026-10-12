/** @generated from post-accounts-account_id-logpush-transformers */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logpush/transformers`,
	body: "json",
} as const;
