/** @generated from magic-transit.advanced-tcp-protection.configs.syn.protection.rules.bulk-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/syn_protection/rules`,
} as const;
