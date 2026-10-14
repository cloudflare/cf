/** @generated from accounts.applications.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/resource-library/applications`,
	body: "json",
} as const;
