/** @generated from cloudforce-one.threat-signals.feeds.skills.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/feeds/${request.feed_id}/skills`,
	body: "json",
} as const;
