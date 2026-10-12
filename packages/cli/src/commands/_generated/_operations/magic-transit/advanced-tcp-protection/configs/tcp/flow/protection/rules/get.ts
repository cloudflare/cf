/** @generated from getTcpFlowProtectionRule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/tcp_flow_protection/rules/${request.rule_id}`,
} as const;
