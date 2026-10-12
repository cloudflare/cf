/** @generated from dls-account-regional-hostnames-list-regions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/regional_hostnames/regions`,
} as const;
