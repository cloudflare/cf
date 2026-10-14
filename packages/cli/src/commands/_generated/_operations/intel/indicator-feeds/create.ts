/** @generated from intel.indicator-feeds.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds`,
	body: "json",
} as const;
