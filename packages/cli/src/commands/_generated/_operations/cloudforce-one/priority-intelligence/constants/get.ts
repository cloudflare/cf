/** @generated from cloudforce-one.priority-intelligence.constants.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/constants`,
	response: false,
} as const;
