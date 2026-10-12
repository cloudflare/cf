/** @generated from load-balancers.regions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/regions/${request.region_id}`,
} as const;
