/** @generated from zero-trust.access.user-populations.users.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations/${request.user_population_id}/users`,
	body: "json",
} as const;
