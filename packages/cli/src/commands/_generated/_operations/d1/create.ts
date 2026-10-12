/** @generated from d1-create-database */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database`,
	body: "json",
} as const;
