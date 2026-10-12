/** @generated from notification-destinations-with-pager-duty-list-pager-duty-services */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/pagerduty`,
} as const;
