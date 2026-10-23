/** @generated from cloudforce-one.threat-intel.events.categories.legacy.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/categories/${request.category_id}`,
	errors: {
		400: "BadRequestError",
	},
} as const;
