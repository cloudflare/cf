/** @generated from realtime.moq.relays.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/moq/relays`,
	query: ["created_before", "created_after", "per_page", "asc"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
