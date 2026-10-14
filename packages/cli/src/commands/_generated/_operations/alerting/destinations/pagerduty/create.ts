/** @generated from alerting.destinations.pagerduty.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/pagerduty/connect`,
} as const;
