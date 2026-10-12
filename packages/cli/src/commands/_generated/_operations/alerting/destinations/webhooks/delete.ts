/** @generated from alerting.destinations.webhooks.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/destinations/webhooks/${request.webhook_id}`,
} as const;
