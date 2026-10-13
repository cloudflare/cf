/** @generated from cloudforce-one.events.tags.categories.create.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tags/categories/create`,
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
