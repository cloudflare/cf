/** @generated from intel.indicator-feeds.snapshots.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/${request.feed_id}/snapshot`,
	pathParams: ["account_id", "feed_id"],
	headers: ["Cf-Async-Upload"],
	body: "form",
	errors: {
		413: "ContentTooLargeError",
	},
} as const;
