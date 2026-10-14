/** @generated from ai.finetunes.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/finetunes`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
