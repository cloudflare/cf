/** @generated from intel.indicator-feeds.uploads.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/${request.feed_id}/uploads/${request.upload_id}`,
} as const;
