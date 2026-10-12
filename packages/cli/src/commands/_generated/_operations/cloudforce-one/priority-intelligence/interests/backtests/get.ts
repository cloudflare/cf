/** @generated from cloudforce-one.priority-intelligence.interests.backtests.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/interests/backtests/${request.backtest_id}`,
	response: false,
	errors: {
		404: "NotFoundError",
	},
} as const;
