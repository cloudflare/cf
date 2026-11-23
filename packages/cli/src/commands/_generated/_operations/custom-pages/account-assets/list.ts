/** @generated from custom-pages.account-assets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_pages/assets`,
	query: ["page", "per_page"],
} as const;
