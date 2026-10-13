/** @generated from cloudforce-one.priority-intelligence.interests.backtests.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests/backtests`,
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
	},
} as const;
