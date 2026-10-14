/** @generated from magic-transit.advanced-tcp-protection.configs.syn.protection.filters.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/syn_protection/filters/${request.filter_id}`,
} as const;
