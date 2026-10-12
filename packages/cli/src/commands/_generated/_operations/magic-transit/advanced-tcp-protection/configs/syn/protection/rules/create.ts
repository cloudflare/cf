/** @generated from magic-transit.advanced-tcp-protection.configs.syn.protection.rules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/syn_protection/rules`,
	body: "json",
} as const;
