/** @generated from zero-trust.access.user-populations.users.replace */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations/${request.user_population_id}/users/${request.user_id}`,
	body: "json",
} as const;
