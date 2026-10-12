/** @generated from get-accounts-account_id-logpush-transformers-transformer_id-content */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logpush/transformers/${request.transformer_id}/content`,
	query: ["version_id"],
} as const;
