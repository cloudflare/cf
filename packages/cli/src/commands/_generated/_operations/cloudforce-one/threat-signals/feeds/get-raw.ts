/** @generated from cloudforce-one.threat-signals.feeds.get-raw */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/feeds/${request.feed_id}/raw`,
	query: ["format"],
	response: false,
} as const;
