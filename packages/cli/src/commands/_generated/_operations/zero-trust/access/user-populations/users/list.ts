/** @generated from zero-trust.access.user-populations.users.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations/${request.user_population_id}/users`,
	query: ["filter", "startIndex", "count", "attributes", "excludedAttributes"],
} as const;
