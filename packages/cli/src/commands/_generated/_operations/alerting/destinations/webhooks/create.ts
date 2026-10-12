/** @generated from notification-webhooks-create-a-webhook */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/webhooks`,
	body: "json",
} as const;
