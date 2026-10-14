/** @generated from intel.indicator-feeds.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/${request.feed_id}`,
	body: "json",
} as const;
