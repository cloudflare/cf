/** @generated from zero-trust.dlp.data-tag-categories.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_categories/${request.category_id}`,
	body: "json",
} as const;
