/** @generated from magic-transit.advanced-tcp-protection.configs.allowlist.prefix.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/allowlist/${request.prefix_id}`,
	body: "json",
} as const;
