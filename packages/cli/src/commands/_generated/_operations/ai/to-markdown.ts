/** @generated from workers-ai-post-to-markdown */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/tomarkdown`,
	pathParams: ["account_id"],
	body: "form",
	errors: {
		400: "BadRequestError",
	},
} as const;
