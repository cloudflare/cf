/** @generated from argo.smart-routing.count-zones-enabled-for-account */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/argo/count_zones_enabled`,
} as const;
