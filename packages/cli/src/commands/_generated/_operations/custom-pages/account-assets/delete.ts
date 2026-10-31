/** @generated from custom-pages.account-assets.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_pages/assets/${request.asset_name}`,
	response: false,
} as const;
