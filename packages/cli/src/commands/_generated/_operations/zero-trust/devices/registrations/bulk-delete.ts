/** @generated from delete-registrations */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/registrations`,
	query: ["id"],
} as const;
