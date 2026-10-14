/** @generated from zero-trust.dlp.data-tags.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_categories/${request.category_id}/data_tags/${request.tag_id}`,
} as const;
