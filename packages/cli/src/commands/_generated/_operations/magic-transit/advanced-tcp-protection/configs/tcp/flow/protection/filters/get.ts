/** @generated from getTcpFlowProtectionFilter */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/tcp_flow_protection/filters/${request.filter_id}`,
} as const;
