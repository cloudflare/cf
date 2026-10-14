/** @generated from addressing.regional-hostnames.regions.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/regional_hostnames/regions`,
} as const;
