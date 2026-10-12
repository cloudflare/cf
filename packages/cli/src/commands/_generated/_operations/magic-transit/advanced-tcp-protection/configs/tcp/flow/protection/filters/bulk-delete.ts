/** @generated from deleteTcpFlowProtectionFiltersForAccount */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/tcp_flow_protection/filters`,
} as const;
