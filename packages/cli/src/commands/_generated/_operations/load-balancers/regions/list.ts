/** @generated from load-balancers.regions.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/regions`,
	query: ["subdivision_code", "subdivision_code_a2", "country_code_a2"],
} as const;
