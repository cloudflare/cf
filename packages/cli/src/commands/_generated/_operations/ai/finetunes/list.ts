/** @generated from workers-ai-list-finetunes */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/finetunes`,
	errors: {
		400: "BadRequestError",
	},
} as const;
