/** @generated from notification-webhooks-update-a-webhook */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/webhooks/${request.webhook_id}`,
	body: "json",
} as const;
