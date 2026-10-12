/** @generated from dlp-data-tags-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_categories/${request.category_id}/data_tags`,
	body: "json",
} as const;
