/** @generated from ai.finetunes.public.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/ai/finetunes/public`,
	query: ["limit", "offset", "orderBy"],
	errors: {
		400: "BadRequestError",
	},
} as const;
