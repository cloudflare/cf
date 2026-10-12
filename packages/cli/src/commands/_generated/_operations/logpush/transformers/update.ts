/** @generated from put-accounts-account_id-logpush-transformers-transformer_id */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logpush/transformers/${request.transformer_id}`,
	body: "json",
} as const;
