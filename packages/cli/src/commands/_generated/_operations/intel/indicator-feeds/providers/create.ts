/** @generated from intel.indicator-feeds.providers.create */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id_path}/intel/indicator-feeds/permissions/createProvider`,
	body: "json",
} as const;
