/** @generated from cloudforce-one.threat-signals.feeds.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/feeds/${request.feed_id}`,
} as const;
