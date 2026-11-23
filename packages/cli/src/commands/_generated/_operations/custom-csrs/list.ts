/** @generated from custom-csrs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_csrs`,
	query: ["page", "per_page", "order", "direction"],
} as const;
