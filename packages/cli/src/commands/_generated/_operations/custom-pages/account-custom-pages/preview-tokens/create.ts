/** @generated from custom-pages.account-custom-pages.preview-tokens.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_pages/preview_tokens`,
	body: "json",
} as const;
