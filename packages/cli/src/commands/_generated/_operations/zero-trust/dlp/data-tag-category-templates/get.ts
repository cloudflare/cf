/** @generated from zero-trust.dlp.data-tag-category-templates.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_category_templates/${request.template_id}`,
} as const;
