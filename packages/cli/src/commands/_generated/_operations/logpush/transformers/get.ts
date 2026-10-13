/** @generated from logpush.transformers.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logpush/transformers/${request.transformer_id}`,
} as const;
