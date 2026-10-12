/** @generated from magic-sites-create-site */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites`,
	body: "json",
} as const;
