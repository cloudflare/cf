/** @generated from r2.temporary-credentials.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/r2/temp-access-credentials`,
	body: "json",
} as const;
