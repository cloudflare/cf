/** @generated from magic-transit.advanced-tcp-protection.configs.tcp.protection.status.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/tcp_protection_status`,
	body: "json",
} as const;
