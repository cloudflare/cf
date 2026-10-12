/** @generated from workers-ai-get-model-schema */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/models/schema`,
	query: ["model"],
	errors: {
		400: "BadRequestError",
	},
} as const;
