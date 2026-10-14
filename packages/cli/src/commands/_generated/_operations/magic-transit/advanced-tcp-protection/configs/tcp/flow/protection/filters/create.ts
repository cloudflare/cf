/** @generated from magic-transit.advanced-tcp-protection.configs.tcp.flow.protection.filters.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/tcp_flow_protection/filters`,
	body: "json",
} as const;
