/** @generated from zero-trust.dex.isps.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/${request.device_id}/isps`,
	query: ["page", "per_page", "cursor", "sort_by", "sort_order", "from", "to"],
} as const;
