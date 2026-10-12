/** @generated from magic-cf1-sites-create-cf1-sites */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf1_sites`,
	body: "json",
} as const;
