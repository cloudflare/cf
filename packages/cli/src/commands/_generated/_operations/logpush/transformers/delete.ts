/** @generated from logpush.transformers.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logpush/transformers/${request.transformer_id}`,
	errors: {
		409: "ConflictError",
	},
} as const;
