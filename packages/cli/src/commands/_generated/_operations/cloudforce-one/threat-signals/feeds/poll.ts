/** @generated from cloudforce-one.threat-signals.feeds.poll */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/feeds/poll`,
	query: ["feed_id"],
} as const;
