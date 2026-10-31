/** @generated from zero-trust.access.user-populations.users.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/user_populations/${request.user_population_id}/users/${request.user_id}`,
	response: false,
} as const;
