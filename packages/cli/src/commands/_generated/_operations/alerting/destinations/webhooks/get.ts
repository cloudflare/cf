/** @generated from alerting.destinations.webhooks.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/webhooks/${request.webhook_id}`,
} as const;
