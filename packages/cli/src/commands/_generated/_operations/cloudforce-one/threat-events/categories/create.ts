/** @generated from post_CategoryCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/categories/create`,
	body: "json",
	errors: {
		400: "BadRequestError",
	},
} as const;
