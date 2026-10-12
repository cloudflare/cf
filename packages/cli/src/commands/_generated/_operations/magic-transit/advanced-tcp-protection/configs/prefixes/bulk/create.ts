/** @generated from bulkCreatePrefixes */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/prefixes/bulk`,
	body: "json",
} as const;
