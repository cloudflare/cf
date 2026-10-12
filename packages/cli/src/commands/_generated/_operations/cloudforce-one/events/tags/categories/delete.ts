/** @generated from delete_TagCategoryDelete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/tag-categories/${request.category_uuid}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
