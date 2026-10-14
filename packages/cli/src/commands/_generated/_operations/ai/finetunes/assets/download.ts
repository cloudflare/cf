/** @generated from ai.finetunes.assets.download */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/finetunes/${request.finetune_id}/finetune-assets/${request.file_name}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
