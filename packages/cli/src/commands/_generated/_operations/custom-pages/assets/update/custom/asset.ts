/** @generated from custom-pages.assets.update.custom.asset */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_pages/assets/${request.asset_name}`,
	body: "json",
} as const;
