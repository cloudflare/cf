/** @generated from magic-transit.advanced-tcp-protection.configs.prefixes.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/prefixes/${request.prefix_id}`,
	body: "json",
} as const;
