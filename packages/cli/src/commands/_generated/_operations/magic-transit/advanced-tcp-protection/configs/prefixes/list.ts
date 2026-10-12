/** @generated from listPrefixesForAccount */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/prefixes`,
	query: ["page", "per_page", "order", "direction"],
	joined: ["page", "per_page", "order", "direction"],
} as const;
