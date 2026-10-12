/** @generated from deleteSynProtectionFilter */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/advanced_tcp_protection/configs/syn_protection/filters/${request.filter_id}`,
} as const;
