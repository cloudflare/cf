/** @generated from workers-ai-upload-finetune-asset */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/finetunes/${request.finetune_id}/finetune-assets`,
	pathParams: ["account_id", "finetune_id"],
	body: "form",
	errors: {
		400: "BadRequestError",
	},
} as const;
