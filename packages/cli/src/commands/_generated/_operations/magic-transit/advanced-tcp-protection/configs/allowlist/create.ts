/** @generated from magic-transit.advanced-tcp-protection.configs.allowlist.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/allowlist`,
	body: "json",
} as const;
