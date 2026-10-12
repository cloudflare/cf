/** @generated from cloudforce-one.threat-signals.feeds.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/feeds/${request.feed_id}`,
	body: "json",
} as const;
