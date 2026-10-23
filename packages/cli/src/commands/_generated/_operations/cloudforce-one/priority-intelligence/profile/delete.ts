/** @generated from cloudforce-one.priority-intelligence.profile.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/profile`,
	response: false,
} as const;
