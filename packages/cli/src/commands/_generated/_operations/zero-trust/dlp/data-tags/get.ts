/** @generated from dlp-data-tags-read */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_categories/${request.category_id}/data_tags/${request.tag_id}`,
} as const;
