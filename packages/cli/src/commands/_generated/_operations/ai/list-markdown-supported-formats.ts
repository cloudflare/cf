/** @generated from workers-ai-get-to-markdown-supported */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/tomarkdown/supported`,
	errors: {
		400: "BadRequestError",
	},
} as const;
