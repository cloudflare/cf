/** @generated from get_CategoryRead */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/event-categories/by-id/${request.category_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
