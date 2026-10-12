/** @generated from notification-destinations-with-pager-duty-connect-pager-duty-token */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/pagerduty/connect/${request.token_id}`,
} as const;
