/** @generated from getAllowlistPrefix */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/allowlist/${request.prefix_id}`,
} as const;
