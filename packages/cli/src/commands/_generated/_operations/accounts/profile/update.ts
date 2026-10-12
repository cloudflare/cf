/** @generated from accounts.profile.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/profile`,
	body: "json",
	response: false,
} as const;
