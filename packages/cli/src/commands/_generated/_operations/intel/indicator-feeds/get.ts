/** @generated from intel.indicator-feeds.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/${request.feed_id}`,
} as const;
