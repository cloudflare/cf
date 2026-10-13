/** @generated from zero-trust.dlp.data-tag-categories.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_tag_categories`,
} as const;
