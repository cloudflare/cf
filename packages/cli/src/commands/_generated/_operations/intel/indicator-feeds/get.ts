/** @generated from custom-indicator-feeds-get-indicator-feed-metadata */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/${request.feed_id}`,
} as const;
