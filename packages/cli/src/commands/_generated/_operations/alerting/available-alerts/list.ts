/** @generated from notification-alert-types-get-alert-types */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/available_alerts`,
} as const;
