/** @generated from notification-destinations-with-pager-duty-connect-pager-duty */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/pagerduty/connect`,
} as const;
