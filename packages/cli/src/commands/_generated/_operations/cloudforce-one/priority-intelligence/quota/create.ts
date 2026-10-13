/** @generated from cloudforce-one.priority-intelligence.quota.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/quota`,
	response: false,
} as const;
