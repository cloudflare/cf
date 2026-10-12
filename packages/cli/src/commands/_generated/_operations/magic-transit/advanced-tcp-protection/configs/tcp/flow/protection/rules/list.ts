/** @generated from listTcpFlowProtectionRulesForAccount */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/tcp_flow_protection/rules`,
	query: ["page", "per_page", "order", "direction"],
	joined: ["page", "per_page", "order", "direction"],
} as const;
