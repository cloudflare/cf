/** @generated from magic-transit.advanced-tcp-protection.configs.tcp.flow.protection.rules.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/tcp_flow_protection/rules/${request.rule_id}`,
	body: "json",
} as const;
