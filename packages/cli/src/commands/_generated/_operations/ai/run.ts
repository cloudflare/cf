/** @generated from workers-ai-post-run-generic */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/run`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
