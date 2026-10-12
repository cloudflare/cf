/** @generated from notification-mechanism-eligibility-get-delivery-mechanism-eligibility */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/eligible`,
} as const;
