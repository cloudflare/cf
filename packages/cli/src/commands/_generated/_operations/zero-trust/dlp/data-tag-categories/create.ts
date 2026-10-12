/** @generated from dlp-data-tag-categories-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_categories`,
	body: "json",
} as const;
