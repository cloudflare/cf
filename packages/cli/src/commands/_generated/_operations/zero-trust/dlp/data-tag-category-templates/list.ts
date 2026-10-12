/** @generated from dlp-data-tag-category-templates-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_category_templates`,
} as const;
