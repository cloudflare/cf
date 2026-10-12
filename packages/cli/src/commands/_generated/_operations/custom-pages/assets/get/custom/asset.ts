/** @generated from custom-pages.assets.get.custom.asset */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_pages/assets/${request.asset_name}`,
} as const;
