/** @generated from zero-trust.access.user-populations.users.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations/${request.user_population_id}/users/${request.user_id}`,
	query: ["attributes", "excludedAttributes"],
} as const;
