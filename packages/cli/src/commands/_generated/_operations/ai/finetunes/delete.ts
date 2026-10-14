/** @generated from ai.finetunes.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/finetunes/${request.finetune_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
