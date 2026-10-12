/** @generated from cloudforce-one.scans.results.get-banners */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/banner/${request.config_id}`,
} as const;
